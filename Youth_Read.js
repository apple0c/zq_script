// version v0.0.1
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const KEY = process.env.YOUTH_READ

async function downFile () {
    const url = 'https://raw.githubusercontent.com/Sunert/Scripts/master/Task/Youth_Read.js'
    await download(url, './')
}

async function changeFiele () {
   let content = await fs.readFileSync('./Youth_Read.js', 'utf8')
   content = content.replace(/var Key = ''/, `var Key = '${KEY}'`)
   await fs.writeFileSync( './Youth_Read.js', content, 'utf8')
}


async function start() {
  if (!KEY) {
    console.log('请填写 YOUTH_READ 后在继续')
    return
  }
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 替换变量
  await changeFiele();
  console.log('替换变量完毕')
  // 执行
  await exec("node Youth_Read.js >> result.txt");
  const path = "./result.txt";
  let content = "";
  if (fs.existsSync(path)) {
    content = fs.readFileSync(path, "utf8");
  }
  console.log(content)
  console.log('执行完毕')

}

start()
