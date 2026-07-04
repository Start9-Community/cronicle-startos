#!/usr/bin/env node
// Force single-node master election in Cronicle's engine.
//
// StartOS runs exactly one Cronicle node and never a worker, so on startup the
// node must elect itself master or it will never schedule jobs. Stock Cronicle's
// eligibility check does not reliably self-elect in a fresh single-container
// install; this injects an unconditional goMaster() (goSlave() only when
// explicitly launched as a worker via IS_WORKER), the same behavior as
// soulteary/docker-cronicle's engine.patch, but anchored on a stable source
// string instead of line numbers so it survives Cronicle version drift.
const fs = require('fs')

const file = 'lib/engine.js'
const anchor = '// determine master server eligibility'
const marker = 'StartOS single-node master election'

let src = fs.readFileSync(file, 'utf8')

if (src.includes(marker)) {
  console.log('patch-engine: lib/engine.js already patched — skipping')
  process.exit(0)
}
if (!src.includes(anchor)) {
  console.error(
    `patch-engine: anchor not found in lib/engine.js ("${anchor}") — ` +
      'Cronicle internals changed; update patches/patch-engine.js',
  )
  process.exit(1)
}

const inject =
  '// ' +
  marker +
  '\n\t\tif (process.env["IS_WORKER"] === "true") { self.goSlave(); } else { self.goMaster(); }\n\n\t\t'

src = src.replace(anchor, inject + anchor)
fs.writeFileSync(file, src)
console.log('patch-engine: injected single-node master election into lib/engine.js')
