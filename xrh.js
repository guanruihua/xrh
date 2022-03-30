const args = process.argv
let glob = undefined
try {
  glob = require("glob")
} catch (_err) {
  // treat glob as optional.
}
const log = help ? console.log : console.error
function xrh(){
	log('log, log, log')
	log(JSON.stringify(args))
}

module.exports = xrh