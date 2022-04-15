// 引入commander
const { program } = require('commander')
const figlet = require('figlet')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const fs = require('fs-extra')
const create = require('../utils/create')
const inquirer = require('inquirer')

// 初始化init命令， project-name就是你的项目名称与项目文件夹名称
program
  .command('init <project-name>')
  // init命令描述
  .description('create a new project name is <project-name>')
  // init命令参数项，因为后续会设置支持覆盖文件夹，所以这里提供一个-f参数
  .option('-f, --force', 'overwrite target directory if it exists')
  // init命名执行后做的事情
  .action(async (projectName, options) => {
    const cwd = process.cwd()
    // 拼接到目标文件夹
    const targetDirectory = path.join(cwd, projectName)
    // 如果目标文件夹已存在
    if (fs.existsSync(targetDirectory)) {
      if (!options.force) {
        // 如果没有设置-f则提示，并退出
        console.error(
          chalk.red(
            `Project already exist! Please change your project name or use ${chalk.greenBright(
              `xrh create ${projectName} -f`
            )} to create`
          )
        )
        return
      }
      // 如果设置了-f则二次询问是否覆盖原文件夹
      const { isOverWrite } = await inquirer.prompt([
        {
          name: 'isOverWrite',
          type: 'confirm',
          message:
            'Target directory already exists, Would you like to overwrite it?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false }
          ]
        }
      ])
      // 如需覆盖则开始执行删除原文件夹的操作
      if (isOverWrite) {
        const spinner = ora(
          chalk.blackBright('The project is Deleting, wait a moment...')
        )
        spinner.start()
        await fs.removeSync(targetDirectory)
        spinner.succeed()
        console.info(
          chalk.green('✨ Deleted Successfully, start init project...')
        )
        console.log()
        // 删除成功后，开始初始化项目
        await create(projectName);
        console.log('init project overwrite')

        return
      }
      console.error(chalk.green('You cancel to create project'))
      return
    }
    // 如果当前路径中不存在同名文件夹，则直接初始化项目
    await create(projectName);
    console.log('init project', projectName)
  })

program
  .command('update')
  .description('update the cli to latest version')
  // update命令执行后做的事情，自动检测更新
  .action(async () => {
    await checkUpdate();
    console.log('update')
  })

program.on('--help', () => {
  // 监听--help命令，输出一个提示
  console.log(
    figlet.textSync('xrh', {
      font: 'Standard',
      horizontalLayout: 'full',
      verticalLayout: 'fitted',
      width: 120,
      whitespaceBreak: true
    })
  )
})

// 这个一定不能忘，且必须在最后！！！
program.parse(process.argv)
