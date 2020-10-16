const child_process = require('child_process')
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 公共变量
const URL = process.env.URL

async function downFile() {
    let file = await download(URL, './')
    await fs.writeFileSync('./app.js', file, 'utf8')
}
const workerProcess = child_process.exec('node app.js ' + i, function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
        console.log('Signal received: ' + error.signal);
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
});

async function start() {
    // 下载最新代码
    await downFile();
    console.log('下载代码完毕')
    // 执行
    
    workerProcess.on('exit', function (code) {
        console.log('子进程已退出，退出码 ' + code);
    });
    //await child_process.exec("node app.js");
    console.log('执行完毕')
}
start()