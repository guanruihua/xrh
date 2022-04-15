const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const boxen = require('boxen')
const renderTemplate = require('./renderTemplate')
const downloadTemplate = require('./download')
const install = require('./install')
const setRegistry = require('./setRegistry')
const { baseUrl, promptList } = require('./constants')

const downloadSuccessfully = (projectName) => {
  const END_MSG = `${chalk.blue(
    '🎉 created project ' + chalk.greenBright(projectName) + ' Successfully'
  )}\n\n 🙏 Thanks for using wb-cli !`
  const BOXEN_CONFIG = {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderColor: 'cyan',
    align: 'center',
    borderStyle: 'double',
    title: '🚀 Congratulations',
    titleAlignment: 'center'
  }

  const showEndMessage = () =>
    process.stdout.write(boxen(END_MSG, BOXEN_CONFIG))
  showEndMessage()

  console.log('👉 Get started with the following commands:')
  console.log(`\n\r\r cd ${chalk.cyan(projectName)}`)
  console.log('\r\r npm install')
  console.log('\r\r npm run start \r\n')
}

const go = (downloadPath, projectRoot) => {
  return downloadTemplate(downloadPath, projectRoot).then((target) => {
    //下载模版
    return {
      downloadTemp: target
    }
  })
}

module.exports = async function create(projectName) {
  // 校验项目名称合法性，项目名称仅支持字符串、数字，因为后续这个名称会用到项目中的package.json以及其他很多地方，所以不能存在特殊字符
  const pattern = /^[a-zA-Z0-9]*$/
  if (!pattern.test(projectName.trim())) {
    console.log(
      `\n${chalk.redBright(
        'You need to provide a projectName, and projectName type must be string or number!\n'
      )}`
    )
    return
  }
  // 询问
  inquirer.prompt(promptList).then(async (answers) => {
    // 目标文件夹
    const destDir = path.join(process.cwd(), projectName)
    // 下载地址
    const downloadPath = `direct:${baseUrl}/${answers.type}-${answers.frame}-template.git#master`
    // 创建文件夹
    fs.mkdir(destDir, { recursive: true }, (err) => {
      if (err) throw err
    })

    console.log(`\nYou select project template url is ${downloadPath} \n`)
    // 开始下载
    const data = await go(downloadPath, destDir)
    // 开始渲染
    await renderTemplate(data.downloadTemp, projectName)
    // 是否需要自动安装依赖，默认否
    const { isInstall, installTool } = await inquirer.prompt([
      {
        name: 'isInstall',
        type: 'confirm',
        default: 'No',
        message: 'Would you like to help you install dependencies?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false }
        ]
      },
      // 选择了安装依赖，则使用哪一个包管理工具
      {
        name: 'installTool',
        type: 'list',
        default: 'npm',
        message: 'Which package manager you want to use for the project?',
        choices: ['npm', 'cnpm', 'yarn'],
        when: function (answers) {
          return answers.isInstall
        }
      }
    ])

    // 开始安装依赖
    if (isInstall) {
      await install({ projectName, installTool })
    }

    // 是否设置了仓库地址
    if (answers.setRegistry) {
      setRegistry(projectName, answers.gitRemote)
    }

    // 项目下载成功
    downloadSuccessfully(projectName)
  })
}
