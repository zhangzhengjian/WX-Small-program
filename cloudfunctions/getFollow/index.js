// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter
// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getFollow().then(function(res){
      return getUserInfo(res);
  })
}

function getFollow(){
  let getFollow = new Promise((resolve,reject) => {
    db.collection('follow').where({
      openid: parameter.openid
    }).field({ followUsers: true }).get().then(res => {
      if(res.data.length > 0){
        resolve(res.data[0].followUsers);
      }else{
        resolve([]);
      }
    })
  })
  return getFollow;
}

function getUserInfo(res){
  let num = 0;
  let userArr = {data:[]};
  let getUserInfo = new Promise((resolve, reject) => {
    if(res.length > 0){
      for(let i=0;i<res.length;i++){
        db.collection('userInfo').where({
          openid: res[i]
        }).field({
          'user.nickName': true,
          'user.avatarUrl': true,
          'user.city': true,
          'perject.age': true,
          'perject.sex': true,
          openid:true
        }).get().then(resp => {
          resp.data[0].isFollow = true;
          num++
          userArr.data.push(resp.data[0]);
          if(num == res.length){
            resolve(userArr);
          }
        })
      }
    }else{
      resolve(userArr);
    }
  })
  return getUserInfo;
}