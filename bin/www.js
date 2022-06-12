// 引入commander
const path = require('path')

// 这个一定不能忘，且必须在最后！！！
// console.log({ process, path })
const [, , ...params] = process.argv
console.log({ params })

