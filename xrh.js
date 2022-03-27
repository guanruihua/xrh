const args = process.argv
const log = help ? console.log : console.error
function xrh(){
	log('log, log, log')
	log(JSON.stringify(args))
}

module.exports = xrh