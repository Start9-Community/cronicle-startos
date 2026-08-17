#!/usr/bin/env node
// First-boot entrypoint for the containerized single-node Cronicle.
//
// Adapted from soulteary/docker-cronicle (MIT). On a fresh install the data
// directory is an empty mounted volume, so this initializes Cronicle's storage
// (bin/control.sh setup) and self-registers this container as server 0 with its
// own hostname/IP before booting the app. On subsequent boots (data/users
// already present) it just starts Cronicle normally.

if (
  require('fs').existsSync('./data/users') ||
  process.env['IS_WORKER'] === 'true'
) {
  console.log('Cronicle storage already initialized.')
  require('../lib/main.js')
} else {
  const { existsSync, unlinkSync } = require('fs')
  const { dirname } = require('path')
  const { spawnSync } = require('child_process')
  const { hostname, networkInterfaces } = require('os')
  const StandaloneStorage = require('pixl-server-storage/standalone')

  if (existsSync('./logs/cronicled.pid')) unlinkSync('./logs/cronicled.pid')

  console.log('Initializing Cronicle storage...')
  const result = spawnSync('/opt/cronicle/bin/control.sh', ['setup'])
  if (result.error || result.stderr.length !== 0) {
    console.log('Storage init failed')
    console.log(result.error?.message || result.stderr.toString())
    process.exit(1)
  }
  console.log(`stdout: ${result.stdout}`)

  process.chdir(dirname(__dirname))

  const config = require('../conf/config.json')
  const storage = new StandaloneStorage(config.Storage, function (err) {
    if (err) throw err
    const dockerHostName = (
      process.env['HOSTNAME'] ||
      process.env['HOST'] ||
      hostname()
    ).toLowerCase()

    const [ip] = Object.keys(networkInterfaces())
      .filter(
        (eth) =>
          networkInterfaces()[eth].filter(
            (addr) => addr.internal === false && addr.family === 'IPv4',
          ).length,
      )
      .map((eth) => networkInterfaces()[eth])[0]

    const data = {
      type: 'list_page',
      items: [{ hostname: dockerHostName, ip: ip.address }],
    }

    const key = 'global/servers/0'
    storage.put(key, data, function () {
      storage.shutdown(function () {
        console.log('Registered self as server: ' + key)
        require('../lib/main.js')
      })
    })
  })
}
