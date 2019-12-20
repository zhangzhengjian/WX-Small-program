// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return getUserInfo(event);
}

function getUserInfo(event){
  let getUserInfo = new Promise((resolve,reject) => {
    db.collection("userInfo").where({
      openid:event.userid
    }).field({ praise:true }).get().then(res => {
       db.collection("userInfo").where({
         openid:event.userid
       }).update({
         data:{
           praise:res.data[0].praise + 1
         }
       }).then(resp => {
         resolve(resp);
       })
    })
  })
  return getUserInfo;
}