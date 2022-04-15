const MetalSmith = require('metalsmith')
const { render } = require('consolidate').ejs
const { promisify } = require('util')
const path = require('path')
const inquirer = require('inquirer')
const renderPro = promisify(render)
const fs = require('fs-extra')

module.exports = async function renderTemplate(result, projectName) {
  if (!result) {
    return Promise.reject(new Error(`无效的目录：${result}`))
  }

  await new Promise((resolve, reject) => {
    MetalSmith(__dirname)
      .clean(false)
      .source(result)
      .destination(path.resolve(projectName))
      .use(async (files, metal, done) => {
        const a = require(path.join(result, 'ask.ts'))
        // 读取ask.ts文件中设置好的询问列表
        let r = await inquirer.prompt(a)
        Object.keys(r).forEach((key) => {
          // 将输入内容前后空格清除，不然安装依赖时package.json读取会报错
          r[key] = r[key]?.trim() || ''
        })
        const m = metal.metadata()
        const tmp = {
          ...r,
          // 将使用到的name全部转换为小写字母
          name: projectName.trim().toLocaleLowerCase()
        }
        Object.assign(m, tmp)
        // 完成后删除模板中的文件
        if (files['ask.ts']) {
          delete files['ask.ts']
          await fs.removeSync(result)
        }
        done()
      })
      .use((files, metal, done) => {
        const meta = metal.metadata()
        // 需要替换的文件的后缀名集合
        const fileTypeList = [
          '.ts',
          '.json',
          '.conf',
          '.xml',
          'Dockerfile',
          '.json'
        ]
        Object.keys(files).forEach(async (file) => {
          let c = files[file].contents.toString()
          // 找到项目模板中设置好的变量进行替换
          for (const type of fileTypeList) {
            if (file.includes(type) && c.includes('<%')) {
              c = await renderPro(c, meta)
              files[file].contents = Buffer.from(c)
            }
          }
        })
        done()
      })
      .build((err) => {
        err ? reject(err) : resolve({ resolve, projectName })
      })
  })
}
