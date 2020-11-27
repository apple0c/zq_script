const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const URL = process.env.URL
const path = "./result.txt";
const runFile = process.env.RUNFILE;

async function downFile() {
    let file = await download(URL, './')
    await fs.writeFileSync(`./${runFile}`, file, 'utf8')
}
async function deleteFile() {
  // 查看文件result.txt是否存在,如果存在,先删除
  const fileExists = await fs.existsSync(`./${runFile}`);
  // console.log('fileExists', fileExists);
  if (fileExists) {
    console.log('存在旧文件，删除\n')
    const unlinkRes = await fs.unlinkSync(`./${runFile}`);
    // console.log('unlinkRes', unlinkRes)
  }
}
async function start() {
    await deleteFile();
    console.log('删除旧文件\n')
    // 下载最新代码
    await downFile();
    console.log('下载代码完毕')
}
start()