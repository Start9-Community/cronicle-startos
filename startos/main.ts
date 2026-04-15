import { writeFile } from 'node:fs/promises'

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

  // Write a password patch script to the subcontainer rootfs.
  // It runs inside the container and uses Cronicle's own bcrypt-node module,
  // so the hash format exactly matches what Cronicle expects.
  //
  // Two cases are covered:
  //   Fresh install  — patches conf/setup.json before the entrypoint runs setup
  //   Existing data  — finds and patches admin.json already in the data volume
  const adminPassword = await storeJson.read((s) => s.adminPassword).once()
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
    .addOneshot('set-admin-password', {
      subcontainer: cronicleSub,
      exec: {
        command: ['node', '/opt/cronicle/.patch-password.js'],
      },
      requires: ['seed-conf'],
    })
    .addDaemon('primary', {
      subcontainer: cronicleSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          CRONICLE_foreground: '1',
          // Disable direct WebSocket connect so socket.io uses location.host
          // (the browser's current host/port), which routes through the StartOS
          // reverse proxy instead of trying to reach the container hostname directly.
          CRONICLE_web_direct_connect: '0',
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
