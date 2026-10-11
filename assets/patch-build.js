const fs = require('node:fs')

const file = 'bin/build-tools.js'
const source = fs.readFileSync(file, 'utf8')
const anchor = "inp.on('end', callback );"

if (source.split(anchor).length !== 3) {
  throw new Error('Expected two stream completion callbacks in bin/build-tools.js')
}

fs.writeFileSync(file, source.replaceAll(anchor, "outp.on('finish', callback );"))
