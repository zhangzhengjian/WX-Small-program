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
        latelyLoginTime: new Date(),
        user: event.user
      }
    }).then(res => {
      if (res.stats.updated == 0){
        db.collection('userInfo').add({
          data: {
            user: event.user,
            praise: 0,
            latelyLoginTime: new Date(),
            firstLoginTime: new Date(),
            openid: event.openid
          }
        }).then(res => {
          resolve(res);
        })
      }else{
        resolve(res);
      }
    }).catch(err => {
      resolve(err);
    })
  })
  return getUserInfo.then(function(data){
    return data
  })
}