const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs-extra')

module.exports = function (downloadPath, target) {
  target = path.join(target)
  return new Promise(function (resolve, reject) {
    const spinner = ora(
      chalk.greenBright('Downloading template, wait a moment...\r\n')
    )
    spinner.start()

    download(downloadPath, target, { clone: true }, async function (err) {
      if (err) {
        spinner.fail()
        reject(err)
        console.error(
          chalk.red(
            `${err}download template failed, please check your network connection and try again`
          )
        )
        await fs.removeSync(target)
        process.exit(1)
      } else {
        spinner.succeed(
          chalk.greenBright(
            '✨ Download template successfully, start to config it: \n'
          )
        )
        resolve(target)
      }
    })
  })
}
