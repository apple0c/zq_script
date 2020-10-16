const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const URL = process.env.URL

async function downFile() {
    let file = await download(URL, './')
    await fs.writeFileSync('./app.js', file, 'utf8')
}

async function start() {
    // 下载最新代码
    await downFile();
    console.log('下载代码完毕')
    // 执行
    await exec("node app.js");
    console.log('执行完毕')
}
start()