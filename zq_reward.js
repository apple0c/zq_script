/*
中青看点 转发分享奖励
从 github @Sunert改写而来 https://raw.githubusercontent.com/Sunert/Scripts/master/Task/youth.js


自用

https:\/\/kd.youth.cn\/WebApi\/ShareNew\/bereadExtraList url script-request-body https://raw.githubusercontent.com/smiek/Actions/master/zq_reward.js

https:\/\/kd.youth.cn\/WebApi\/ShareNew\/execExtractTask url script-request-body https://raw.githubusercontent.com/smiek/Actions/master/zq_reward.js

*/

let s = 200 //各数据接口延迟
const $ = new Env("中青看点")
const name = $.name + "-转发分享奖励";
const notify = $.isNode() ? require('./sendNotify') : '';
let logs = $.getdata('zqlogs') || false, signresult;
let cookiesArr = [], signheaderVal = '',
    shareArr = [], shareheaderVal = '',
    readArr = [], sharebodyVal = '';
let CookieYouth = [], ARTBODYs = [],
    ShareYouth = [];
if ($.isNode()) {
    if (process.env.YOUTH_HEADER && process.env.YOUTH_HEADER.indexOf('#') > -1) {
        CookieYouth = process.env.YOUTH_HEADER.split('#');
    } else {
        CookieYouth = process.env.YOUTH_HEADER.split()
    };
    if (process.env.YOUTH_SHARE_HEADER && process.env.YOUTH_SHARE_HEADER.indexOf('#') > -1) {
        ShareYouth = process.env.YOUTH_SHARE_HEADER.split('#');
    } else {
        ShareYouth = process.env.YOUTH_SHARE_HEADER.split()
    };
    if (process.env.YOUTH_SHARE_BODY && process.env.YOUTH_SHARE_BODY.indexOf('#') > -1) {
        ARTBODYs = process.env.YOUTH_SHARE_BODY.split('#');
    } else {
        ARTBODYs = process.env.YOUTH_SHARE_BODY.split()
    };
}

if ($.isNode()) {
    Object.keys(CookieYouth).forEach((item) => {
        if (CookieYouth[item]) {
          cookiesArr.push(CookieYouth[item])
        }
      })
    Object.keys(ShareYouth).forEach((item) => {
        if (ShareYouth[item]) {
            shareArr.push(ShareYouth[item])
        }
    })
    Object.keys(ARTBODYs).forEach((item) => {
        if (ARTBODYs[item]) {
            readArr.push(ARTBODYs[item])
        }
    })
    console.log(`============ 脚本执行-国际标准时间(UTC)：${new Date().toLocaleString()}  =============\n`)
    console.log(`============ 脚本执行-北京时间(UTC+8)：${new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString()}  =============\n`)
} else {
    cookiesArr.push($.getdata('youthheader_zq'));
    shareArr.push($.getdata('youthheader_share_sm'));
    readArr.push($.getdata('youthbody_share_sm'));
}

if (typeof $request !== 'undefined') {
    GetCookie();
    return;
}

!(async () => {
    if (!shareArr[0]) {
        $.msg(name, '【提示】请先获取中青看点 转发分享cookie')
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            signheaderVal = cookiesArr[i];
            shareheaderVal = shareArr[i];
            sharebodyVal = readArr[i];
            $.index = i + 1;
        }
        await signInfo();
        await shareList();

        if($.isNode()){
            switch (parseInt($.time('HH'))) {
                case 22:
                case 23:
                    await dailyTasks();
                    break;
                case 3:
                case 4:
                    await dailyTasks();
                    break;
                case 11:
                case 12:
                    await dailyTasks();
                    break;
                default:
                    break;
            }
        }else{
            switch (parseInt($.time('HH'))) {
                case 6:
                case 7:
                    await dailyTasks();
                    break;
                case 11:
                case 12:
                    await dailyTasks();
                    break;
                case 19:
                case 20:
                    await dailyTasks();
                    break;
                default:
                    break;
            }
        }
        
        await showmsg();
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


function GetCookie() {
    if ($request && $request.method != `OPTIONS` && $request.url.match(/\/WebApi\/ShareNew\/bereadExtraList/)) {
        const shareheaderVal = JSON.stringify($request.headers)
        const sharebodyVal = $request.body
        if (sharebodyVal) $.setdata(sharebodyVal, 'youthbody_share_sm')
        if (shareheaderVal) $.setdata(shareheaderVal, 'youthheader_share_sm')
        $.log(`${name} 获取转发分享Cookie: 成功,shareheaderVal: ${shareheaderVal}`)
        $.log(`${name} 获取转发分享Cookie: 成功,sharebodyVal: ${sharebodyVal}`)
        $.msg(name, `获取转发分享Cookie: 成功🎉`, ``)
    }
}

function signInfo() {
    return new Promise((resolve, reject) => {
        const infourl = {
            url: 'https://kd.youth.cn/TaskCenter/getSign',
            headers: JSON.parse(signheaderVal),
        }
        $.post(infourl, (error, response, data) => {
            signinfo = JSON.parse(data);
            if (signinfo.status == 2) {
                signresult = `签到失败，Cookie已失效‼️`;
                $.msg(name, signresult, "");
                return;
            } else if (signinfo.status == 1) {
                cash = signinfo.data.user.money
                subTitle = `【收益总计】${signinfo.data.user.score}青豆  现金约${cash}元`;
                nick = `账号: ${signinfo.data.user.nickname}`;
                detail ='<本次收益>：\n'
            } else {
                subTitle = `${signinfo.msg}`;
                detail = ``;
            }
            resolve()
        })
    })
}
// 修改请求参数中的时间
function editshareBody() {
    var timestamp = Date.parse(new Date())/1000;
    let val = sharebodyVal.replace(/request_time=(\d+)/, `request_time=${timestamp}`);
    return val;
}
//分享转发
function shareList() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let bodyVal = editshareBody()
            const url = {
                url: 'https://kd.youth.cn/WebApi/ShareNew/bereadExtraList',
                headers: JSON.parse(shareheaderVal),
                body: bodyVal,
            }
            $.post(url, async(error, response, data) => {
                res = JSON.parse(data)
                if (res.status == 1) {
                    await shareCheck(res)
                } else if (res.status == 0) {
                    detail += `【阅读分享】获取信息失败\n`;
                }
                resolve()
            })
        },s);
    })
}
//分享转发判断
function shareCheck(res) {
    return new Promise(async(resolve) => {
        let item = '';
        for(let num = 0;num < res.data.taskList.length;num++){
          let time = parseInt($.time('HH'));
            item = res.data.taskList[num];
            if(item.name == '连续转发奖励') continue;
            if(item.status == 0 && item.name == '被10位好友阅读'){
                let score = item.score - item.norm_money;
                await shareRead(item.name,item.action,score)
                continue;
            }else if(item.status == 0 && (
                ( item.name == '清晨分享') ||
                ( item.name == '午间分享') ||
                ( item.name == '晚间分享')
            )){
                let score = item.score - item.norm_money;
                if($.isNode() && ( (time > 20 && time < 2) ||
                (time > 2 && time < 8) ||
                ( time > 8 && time < 14 )) ){
                    if(res.data.hot_article){
                        await shareReadAction(res.data.hot_article.id);
                    }
                    await shareRead(item.name,item.action,score)
                    break;
                }else if((time > 4 && time < 10) ||
                ( time > 10 && time < 16 ) ||
                ( time > 16 && time < 22 )){
                    if(res.data.hot_article){
                        await shareReadAction(res.data.hot_article.id);
                    }
                    await shareRead(item.name,item.action,score);
                    break;
                }
            }
        }
      resolve();
    })
}
function shareReadAction(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let bodyVal = editshareBody()
            const url = {
                url: 'https://kd.youth.cn/WebApi/ShareNew/getShareArticleReward',
                headers: JSON.parse(shareheaderVal),
                body: `${bodyVal}&article_id=${id}`,
            }
            $.post(url, (error, response, data) => {
                res = JSON.parse(data)
                if (res.status == 1) {
                    detail += `【分享文章】+${res.data.score}个青豆\n`;
                } else if (res.status == 0) {
                    detail += `【分享文章】 ${res.msg}\n`;
                }else{
                    detail += `【分享文章】 执行失败\n`;
                }
                resolve()
            })
        },s);
    })
}
function shareRead(title,action,score) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let bodyVal = editshareBody()
            const url = {
                url: 'https://kd.youth.cn/WebApi/ShareNew/execExtractTask',
                headers: JSON.parse(shareheaderVal),
                body: `${bodyVal}&action=${action}`,
            }
            $.post(url, (error, response, data) => {
                res = JSON.parse(data)
                if (res.status == 1) {
                    detail += `【${title}】+${score}个青豆\n`
                } else if (res.status == 0) {
                    detail += `【${title}】${res.msg}\n`;
                }
                resolve()
            })
        },s);
    })
}
// 每日时段红包
function dailyTasks() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const url = {
                url: 'https://kd.youth.cn/WebApi/Task/receiveBereadRed',
                headers: JSON.parse(signheaderVal),
            }
            $.get(url, (error, response, data) => {
                res = JSON.parse(data)
                if(res.code == 1) {
                    detail += `【每日时段红包】+${res.data.score}个青豆\n`
                }else{

                }
                resolve()
            })
        },s);
    })
}
async function showmsg() {
    if ($.isNode()) {
        console.log(`【收益总计】${signinfo.data.user.score}青豆  现金约${cash}元\n`+ detail)
    } else {
        $.msg(name + " " + nick, subTitle, detail)
    }
}
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
