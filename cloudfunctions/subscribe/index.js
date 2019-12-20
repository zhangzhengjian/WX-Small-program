// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise');

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getAccessToken().then(function(res){
    return subscribeInfo(res);
  })
}

function getAccessToken(){
  let getAccessToken = new Promise((resolve,reject) => {
     db.collection("access_token").where({
       _id:"access_token"
     }).get().then(res => {
       resolve(res);
     })
  })
  return getAccessToken;
}

function subscribeInfo(res) {
  let subscribeInfo = new Promise((resolve, reject) => {
    const subscribe = {
      method: 'POST',
      url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${res.data[0].value}`,
      body: parameter.parameter,
      json: true
    };
    // const resultValue = await rp(subscribe);
    resolve(rp(subscribe))
  })
  return subscribeInfo;
}