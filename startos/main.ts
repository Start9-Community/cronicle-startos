import { readFile, writeFile } from 'node:fs/promises'

import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Cronicle'))

  const mounts = sdk.Mounts.of()
    .mountVolume({ volumeId: 'main', subpath: 'data', mountpoint: '/opt/cronicle/data', readonly: false })
    .mountVolume({ volumeId: 'main', subpath: 'conf', mountpoint: '/opt/cronicle/conf', readonly: false })
    .mountVolume({ volumeId: 'main', subpath: 'logs', mountpoint: '/opt/cronicle/logs', readonly: false })
    .mountVolume({ volumeId: 'main', subpath: 'plugins', mountpoint: '/opt/cronicle/plugins', readonly: false })

  const cronicleSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'cronicle' },
    mounts,
    'cronicle-sub',
  )

  // Patch _combo.js — the single bundled JS file the browser always loads (hardcoded in
  // index.html).  Cronicle builds the live-log WebSocket and API URLs from the internal
  // container IP/hostname — unreachable through the StartOS reverse proxy.
  // We replace both URL-construction blocks in the JobDetails section so they always use
  // location.origin instead.  We also delete _combo.js.gz so the server can't serve the
  // stale pre-compressed version.
  const comboPath = `${cronicleSub.rootfs}/opt/cronicle/htdocs/js/_combo.js`
  let comboCode = await readFile(comboPath, 'utf8')

  const patch1Marker = "var url = app.proto + job.hostname"
  const patch2Marker = "var remote_api_url = app.proto + job.hostname"
  if (!comboCode.includes(patch1Marker)) throw new Error(`_combo.js patch 1 marker not found — image may have changed`)
  if (!comboCode.includes(patch2Marker)) throw new Error(`_combo.js patch 2 marker not found — image may have changed`)

  // Block 1: live-log WebSocket url.
  //   If job.hostname equals app.masterHostname (job runs on the local master), route through
  //   the StartOS proxy via location.origin.  External workers keep the original direct connect.
  //   Ends just before: $('#d_live_job_log').append(
  comboCode = comboCode.replace(
    /var url = app\.proto \+ job\.hostname[^;]+;[\s\S]*?(?=\$\('#d_live_job_log'\))/,
    "var url = config.custom_live_log_socket_url ? config.custom_live_log_socket_url\n\t\t\t: (job.hostname === app.masterHostname) ? location.origin.replace(/^http/, 'ws')\n\t\t\t: app.proto + job.hostname + ':' + app.port; // StartOS\n\t\t",
  )
  if (comboCode.includes(patch1Marker)) throw new Error(`_combo.js patch 1 regex did not match — check lookahead`)

  // Block 2: live-log view/download link base URL (HTTP, not WebSocket).
  //   Same logic: master hostname → proxy, external worker → direct.
  //   Ends just before: $('#d_live_job_view_link').html(
  comboCode = comboCode.replace(
    /var remote_api_url = app\.proto \+ job\.hostname[^;]+;[\s\S]*?(?=\$\('#d_live_job_view_link'\))/,
    "var remote_api_url = config.custom_live_log_socket_url ? config.custom_live_log_socket_url + config.base_api_uri\n\t\t\t: (job.hostname === app.masterHostname) ? location.origin + config.base_api_uri\n\t\t\t: app.proto + job.hostname + ':' + app.port + config.base_api_uri; // StartOS\n\t\t",
  )
  if (comboCode.includes(patch2Marker)) throw new Error(`_combo.js patch 2 regex did not match — check lookahead`)

  await writeFile(comboPath, comboCode)

  // Remove the pre-compressed copy so the web server can't serve stale gzipped content.
  const { unlink } = await import('node:fs/promises')
  await unlink(`${cronicleSub.rootfs}/opt/cronicle/htdocs/js/_combo.js.gz`).catch(() => {})

  // Write a password patch script to the subcontainer rootfs.
  // It runs inside the container and uses Cronicle's own bcrypt-node module,
  // so the hash format exactly matches what Cronicle expects.
  //
  // Two cases are covered:
  //   Fresh install  — patches conf/setup.json before the entrypoint runs setup
  //   Existing data  — finds and patches admin.json already in the data volume
  // Resolve SMTP credentials from the user's selection (system/custom/disabled).
  // Runs with .const(effects) so the service restarts if the SMTP action is used.
  const smtpSelection = await storeJson.read((s) => s.smtp).const(effects)
  let smtpCredentials: T.SmtpValue | null = null

  if (smtpSelection?.selection === 'system') {
    smtpCredentials = await sdk.getSystemSmtp(effects).const()
    if (smtpCredentials && smtpSelection.value.customFrom) {
      smtpCredentials.from = smtpSelection.value.customFrom
    }
  } else if (smtpSelection?.selection === 'custom') {
    const { host, from, username, password, security } = smtpSelection.value.provider.value
    smtpCredentials = {
      host,
      port: Number(security.value.port),
      from,
      username,
      password: password ?? null,
      security: security.selection,
    }
  }

  // Map resolved credentials to Cronicle's config.json fields.
  // Written as a Node.js script that patches conf/config.json after seed-conf runs.
  const cronSmtp = smtpCredentials
    ? (() => {
        const mailOptions: Record<string, unknown> = {
          secure: smtpCredentials!.security === 'tls',
          requireTLS: smtpCredentials!.security === 'starttls',
        }
        if (smtpCredentials!.username) {
          mailOptions.auth = { user: smtpCredentials!.username, pass: smtpCredentials!.password ?? '' }
        }
        return {
          smtp_hostname: smtpCredentials!.host,
          smtp_port: smtpCredentials!.port,
          email_from: smtpCredentials!.from,
          mail_options: mailOptions,
        }
      })()
    : { smtp_hostname: '', smtp_port: 25, email_from: 'admin@localhost', mail_options: {} }

  const applySmtpScript = `
const fs = require('fs');
const patch = ${JSON.stringify(cronSmtp)};
const cfgPath = '/opt/cronicle/conf/config.json';
try {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  Object.assign(cfg, patch);
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, '\\t'));
  console.log('SMTP config applied: ' + (patch.smtp_hostname || 'disabled'));
} catch(e) { console.error('apply-smtp failed: ' + e.message); }
`
  await writeFile(`${cronicleSub.rootfs}/opt/cronicle/.apply-smtp.js`, applySmtpScript)

  const adminPassword = await storeJson.read((s) => s.adminPassword).const(effects)
  if (adminPassword) {
    // The password formula used by pixl-server-user (Cronicle's auth layer) is:
    //   bcrypt.hashSync(plaintext + userSalt)     — to store
    //   bcrypt.compareSync(plaintext + userSalt, hash) — to verify
    // where userSalt is the per-user `salt` field in the user record (default: "salty").
    // Library: bcryptjs (dep of pixl-server-user, available in the container).
    const patchScript = `
// bcrypt-node is a direct Cronicle dep at the top-level node_modules.
// bcryptjs (used by pixl-server-user for verification) is nested and not resolvable
// from here, but both implement standard bcrypt so hashes are interoperable.
const bcrypt = require('/opt/cronicle/node_modules/bcrypt-node');
const fs = require('fs');
const { execSync } = require('child_process');
const password = ${JSON.stringify(adminPassword)};

function makeHash(plaintext, userSalt) {
  return bcrypt.hashSync(plaintext + (userSalt || 'salty'), bcrypt.genSaltSync(10));
}

// 1. Patch conf/setup.json so fresh-install setup creates admin with our hash.
//    storage-cli.js setup reads from conf/setup.json (not sample_conf).
const setupFile = '/opt/cronicle/conf/setup.json';
if (fs.existsSync(setupFile)) {
  try {
    const setup = JSON.parse(fs.readFileSync(setupFile, 'utf8'));
    (setup.storage || []).forEach(function(item) {
      if (Array.isArray(item) && item[0] === 'put' && item[1] === 'users/admin' && item[2]) {
        const userSalt = item[2].salt || 'salty';
        item[2].password = makeHash(password, userSalt);
        console.log('Patched conf/setup.json (salt: ' + userSalt + ')');
      }
    });
    fs.writeFileSync(setupFile, JSON.stringify(setup));
  } catch(e) { console.error('Error patching setup.json: ' + e.message); }
}

// 2. Patch existing admin user records in the data volume.
//    Covers existing installs where setup has already run.
try {
  const found = execSync('find /opt/cronicle/data -name admin.json 2>/dev/null').toString().trim();
  if (!found) { console.log('No admin.json found — fresh install'); process.exit(0); }
  found.split('\\n').filter(Boolean).forEach(function(file) {
    try {
      const user = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (user.username === 'admin') {
        const userSalt = user.salt || 'salty';
        user.password = makeHash(password, userSalt);
        fs.writeFileSync(file, JSON.stringify(user));
        console.log('Patched existing user: ' + file + ' (salt: ' + userSalt + ')');
      }
    } catch(e) { console.error('Error patching ' + file + ': ' + e.message); }
  });
} catch(e) { console.error('find failed: ' + e.message); }
`
    await writeFile(`${cronicleSub.rootfs}/opt/cronicle/.patch-password.js`, patchScript)
  }

  return sdk.Daemons.of(effects)
    .addOneshot('seed-conf', {
      subcontainer: cronicleSub,
      exec: {
        command: [
          'sh', '-c',
          'test -f /opt/cronicle/conf/config.json || cp -r /opt/cronicle/sample_conf/. /opt/cronicle/conf/',
        ],
      },
      requires: [],
    })
    .addOneshot('apply-smtp', {
      subcontainer: cronicleSub,
      exec: {
        command: ['node', '/opt/cronicle/.apply-smtp.js'],
      },
      requires: ['seed-conf'],
    })
    .addOneshot('set-admin-password', {
      subcontainer: cronicleSub,
      exec: {
        command: ['node', '/opt/cronicle/.patch-password.js'],
      },
      requires: ['apply-smtp'],
    })
    .addDaemon('primary', {
      subcontainer: cronicleSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          CRONICLE_foreground: '1',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['set-admin-password'],
    })
})
