// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let getUserInfo = new Promise((resolve,reject) => {
    db.collection('userInfo').where({
      openid:event.openid
    }).update({
      data:{
        perject:event.userInfo
      }
    }).then(res => {
      resolve(res);
    })
  })
  return getUserInfo.then(function(data){
    return data;
  })
}