// version v0.0.1
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const URL = process.env.URL
//const KEY = process.env.JD_COOKIE

async function downFile () {
    let file = await download(URL, './')
    await fs.writeFileSync('./app.js',file, 'utf8')
    let content = await fs.readFileSync('./app.js', 'utf8')
    console.log(content)
}

async function start() {
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 执行
  await exec("node app.js >> result.txt");
  console.log('执行完毕')
    const path = "./result.txt";
    let content = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }
    console.log("京东签到-" + new Date().toLocaleDateString()+ content)
  
}
start()
