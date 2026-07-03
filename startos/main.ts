import { readFile, writeFile } from 'node:fs/promises'

import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Cronicle'))

  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: 'data',
      mountpoint: '/opt/cronicle/data',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'main',
      subpath: 'conf',
      mountpoint: '/opt/cronicle/conf',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'main',
      subpath: 'logs',
      mountpoint: '/opt/cronicle/logs',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'main',
      subpath: 'plugins',
      mountpoint: '/opt/cronicle/plugins',
      readonly: false,
    })

  const cronicleSub = await sdk.SubContainer.eager(
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

  const patch1Marker = 'var url = app.proto + job.hostname'
  const patch2Marker = 'var remote_api_url = app.proto + job.hostname'
  if (!comboCode.includes(patch1Marker))
    throw new Error(
      `_combo.js patch 1 marker not found — image may have changed`,
    )
  if (!comboCode.includes(patch2Marker))
    throw new Error(
      `_combo.js patch 2 marker not found — image may have changed`,
    )

  // Block 1: live-log WebSocket url.
  //   If job.hostname equals app.masterHostname (job runs on the local master), route through
  //   the StartOS proxy via location.origin.  External workers keep the original direct connect.
  //   Ends just before: $('#d_live_job_log').append(
  comboCode = comboCode.replace(
    /var url = app\.proto \+ job\.hostname[^;]+;[\s\S]*?(?=\$\('#d_live_job_log'\))/,
    "var url = config.custom_live_log_socket_url ? config.custom_live_log_socket_url\n\t\t\t: (job.hostname === app.masterHostname) ? location.origin.replace(/^http/, 'ws')\n\t\t\t: app.proto + job.hostname + ':' + app.port; // StartOS\n\t\t",
  )
  if (comboCode.includes(patch1Marker))
    throw new Error(`_combo.js patch 1 regex did not match — check lookahead`)

  // Block 2: live-log view/download link base URL (HTTP, not WebSocket).
  //   Same logic: master hostname → proxy, external worker → direct.
  //   Ends just before: $('#d_live_job_view_link').html(
  comboCode = comboCode.replace(
    /var remote_api_url = app\.proto \+ job\.hostname[^;]+;[\s\S]*?(?=\$\('#d_live_job_view_link'\))/,
    "var remote_api_url = config.custom_live_log_socket_url ? config.custom_live_log_socket_url + config.base_api_uri\n\t\t\t: (job.hostname === app.masterHostname) ? location.origin + config.base_api_uri\n\t\t\t: app.proto + job.hostname + ':' + app.port + config.base_api_uri; // StartOS\n\t\t",
  )
  if (comboCode.includes(patch2Marker))
    throw new Error(`_combo.js patch 2 regex did not match — check lookahead`)

  await writeFile(comboPath, comboCode)

  // Remove the pre-compressed copy so the web server can't serve stale gzipped content.
  const { unlink } = await import('node:fs/promises')
  await unlink(
    `${cronicleSub.rootfs}/opt/cronicle/htdocs/js/_combo.js.gz`,
  ).catch(() => {})

  // SMTP selection is persistent config: read it reactively (mapped) so changing it
  // via the Configure SMTP action restarts the service to re-apply it below.
  const smtpSelection = await storeJson.read((s) => s.smtp).const(effects)

  // The admin password is a one-time trigger: read it NON-reactively (.once) so that
  // clearing it after we apply it (clear-pending-admin-password oneshot, below) does
  // not restart main. The Set Admin Password action drives its own restart via
  // sdk.restart. Reading it via a reactive .const — as this used to — is exactly what
  // re-applied the stored password on every restart, reverting any password the user
  // had changed inside Cronicle itself.
  const pendingAdminPassword =
    (await storeJson.read((s) => s.pendingAdminPassword).once()) ?? null
  let smtpCredentials: T.SmtpValue | null = null

  if (smtpSelection?.selection === 'system') {
    smtpCredentials = await sdk.getSystemSmtp(effects).const()
    if (smtpCredentials && smtpSelection.value.customFrom) {
      smtpCredentials.from = smtpSelection.value.customFrom
    }
  } else if (smtpSelection?.selection === 'custom') {
    const { host, from, username, password, security } =
      smtpSelection.value.provider.value
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
          mailOptions.auth = {
            user: smtpCredentials!.username,
            pass: smtpCredentials!.password ?? '',
          }
        }
        return {
          smtp_hostname: smtpCredentials!.host,
          smtp_port: smtpCredentials!.port,
          email_from: smtpCredentials!.from,
          mail_options: mailOptions,
        }
      })()
    : {
        smtp_hostname: '',
        smtp_port: 25,
        email_from: 'admin@localhost',
        mail_options: {},
      }

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
  await writeFile(
    `${cronicleSub.rootfs}/opt/cronicle/.apply-smtp.js`,
    applySmtpScript,
  )

  // Write a password patch script to the subcontainer rootfs. It runs inside the
  // container and uses Cronicle's own bcrypt-node module, so the hash format
  // matches what Cronicle expects. Two cases are covered:
  //   Fresh install  — patches conf/setup.json before the entrypoint runs setup
  //   Existing data  — finds and patches admin.json already in the data volume
  if (pendingAdminPassword) {
    // pixl-server-user (Cronicle's auth layer) uses bcrypt-node and the formula:
    //   store:  bcrypt.hashSync(plaintext + userSalt)        — userSalt is user.salt field
    //   verify: bcrypt.compareSync(plaintext + userSalt, hash)
    //
    // pixl-server-storage (Filesystem engine) maps storage key → file path via MD5:
    //   key "users/admin" → data/users/<md5[0:2]>/<md5[2:4]>/<md5[4:6]>/<md5>.json
    //   MD5("users/admin") = 3468bc0c4e5f6aa06c7aee62212ac18f (constant, hardcoded below)
    const patchScript = `
const bcrypt = require('/opt/cronicle/node_modules/bcrypt-node');
const fs = require('fs');
const password = ${JSON.stringify(pendingAdminPassword)};

// Storage key "users/admin" maps to this fixed path via MD5 sharding.
// MD5("users/admin") = 3468bc0c4e5f6aa06c7aee62212ac18f
const dataFile = '/opt/cronicle/data/users/34/68/bc/3468bc0c4e5f6aa06c7aee62212ac18f.json';

// 1. Patch conf/setup.json so a first-run storage-cli setup uses our password.
const setupFile = '/opt/cronicle/conf/setup.json';
if (fs.existsSync(setupFile)) {
  try {
    const setup = JSON.parse(fs.readFileSync(setupFile, 'utf8'));
    (setup.storage || []).forEach(function(item) {
      if (Array.isArray(item) && item[0] === 'put' && item[1] === 'users/admin' && item[2]) {
        const userSalt = item[2].salt || 'salty';
        item[2].password = bcrypt.hashSync(password + userSalt);
        console.log('Patched conf/setup.json (salt: ' + userSalt + ')');
      }
    });
    fs.writeFileSync(setupFile, JSON.stringify(setup));
  } catch(e) { console.error('Error patching setup.json: ' + e.message); }
}

// 2. Patch the live admin user record in the data volume.
if (fs.existsSync(dataFile)) {
  try {
    const user = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const userSalt = user.salt || 'salty';
    user.password = bcrypt.hashSync(password + userSalt);
    user.modified = Math.floor(Date.now() / 1000);
    fs.writeFileSync(dataFile, JSON.stringify(user));
    console.log('Patched admin user record (salt: ' + userSalt + ')');
  } catch(e) { console.error('Error patching admin user record: ' + e.message); }
} else {
  console.log('Admin data file not found — will be created by first-run setup');
}
`
    await writeFile(
      `${cronicleSub.rootfs}/opt/cronicle/.patch-password.js`,
      patchScript,
    )
  } else {
    // No password pending — write a no-op so the set-admin-password oneshot
    // still succeeds. A password is only pending right after install (the
    // generated one, until it's retrieved) or after the Reset Admin Password
    // action; otherwise Cronicle keeps the credential in its own data volume.
    await writeFile(
      `${cronicleSub.rootfs}/opt/cronicle/.patch-password.js`,
      'process.exit(0)\n',
    )
  }

  return sdk.Daemons.of(effects)
    .addOneshot('seed-conf', {
      subcontainer: cronicleSub,
      exec: {
        command: [
          'sh',
          '-c',
          'test -f /opt/cronicle/conf/config.json || cp -r /opt/cronicle/sample_conf/. /opt/cronicle/conf/',
        ],
      },
      requires: [],
    })
    .addOneshot('install-plugin-deps', {
      subcontainer: cronicleSub,
      exec: {
        // For each plugin directory that has a package.json but no node_modules, run
        // npm install.  Written as a multi-statement script so failures are visible.
        command: [
          'sh',
          '-c',
          `set -e
for dir in /opt/cronicle/plugins/*/; do
  [ -d "$dir" ] || continue
  [ -f "$dir/package.json" ] || continue
  [ -d "$dir/node_modules" ] && continue
  echo "--- installing npm deps for $dir ---"
  cd "$dir"
  npm install --production
  echo "--- done: $dir ---"
done`,
        ],
      },
      requires: ['seed-conf'],
    })
    .addOneshot('apply-smtp', {
      subcontainer: cronicleSub,
      exec: {
        command: ['node', '/opt/cronicle/.apply-smtp.js'],
      },
      requires: ['install-plugin-deps'],
    })
    .addOneshot('set-admin-password', {
      subcontainer: cronicleSub,
      exec: {
        command: ['node', '/opt/cronicle/.patch-password.js'],
      },
      requires: ['apply-smtp'],
    })
    .addOneshot('clear-pending-admin-password', () =>
      // The password was baked into .patch-password.js and written by the
      // set-admin-password oneshot into conf/setup.json and/or the live admin record
      // (both on the persistent volume). Clear the one-time trigger now that it's been
      // applied, so it isn't re-applied — and isn't reverted-on-restart — on the next
      // boot. pendingAdminPassword is read .once above, so this write does not restart
      // main; gated on set-admin-password so a failed apply retries next startup.
      pendingAdminPassword
        ? {
            subcontainer: null,
            exec: {
              fn: async () => {
                await storeJson.merge(effects, { pendingAdminPassword: null })
                return null
              },
            },
            requires: ['set-admin-password'],
          }
        : null,
    )
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
