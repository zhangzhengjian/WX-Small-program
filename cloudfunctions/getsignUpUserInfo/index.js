// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserInfo();
}

function getUserInfo(){
  let getUserInfo = new Promise((resolve,reject) => {
    let num = 0;
    let userInfoArr = [];
    for (let i = 0; i < parameter.useridArr.length;i++){
      db.collection("userInfo").where({
        openid: parameter.useridArr[i]
    }).field({
      openid:true,
      'user.avatarUrl':true,
      'user.nickName':true,
      'perject.age':true,
      'perject.sex':true
    }).get().then(res => {
      num++
      userInfoArr.push(res.data[0])
      if (num == parameter.useridArr.length){
        resolve({data:userInfoArr})
      }
    })
    }
  })
  return getUserInfo;
}