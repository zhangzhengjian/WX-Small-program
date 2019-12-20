// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return getUserPhoto(event);
}

function getUserPhoto(event){
  let getUserPhoto = new Promise((resolve,reject) => {
    db.collection('userPhoto').where({
      openid:event.openid
    }).update({
      data:{
        type:event.type
      }
    }).then(res => {
      resolve(res);
    })
  })
  return getUserPhoto;
}