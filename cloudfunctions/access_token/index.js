// 云函数入口文件
const cloud = require('wx-server-sdk');
const rp = require('request-promise');

cloud.init()

let db = cloud.database();

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  return getToken().then(function(res){
    return accessToken(res);
  });
}

function getToken(){
  let access_token = new Promise((resolve, reject) => {
    const AccessToken = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type:'client_credential',
        appid: 'wxe92b6203b3b711fb',
        secret: '4456b91bf2febf845b8afce6dfca5ad1'
      },
      json: true
    };
    // const resultValue = await rp(AccessToken);
    resolve(rp(AccessToken))
  })
  return access_token;
}

function accessToken(res){
  let accessToken = new Promise((resolve,reject) => {
     db.collection("access_token").where({
       _id:"access_token"
     }).update({
       data:{ value:res.access_token }
     }).then(res => {
        resolve(res);
     })
  })
  return accessToken;
}