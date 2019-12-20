// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUser().then(function(res){
    return getFollowUser(res);
  });
}

function getUser() {
  let getUser = new Promise((resolve, reject) => {
    db.collection('userInfo').where({
      'user.nickName': db.RegExp({
        regexp: parameter.value,
        options: 'i',
      })
    }).field({
      'user.nickName': true,
      'user.avatarUrl': true,
      'user.city': true,
      'perject.age': true,
      'perject.sex': true,
      openid: true
      }).skip(parameter.num * parameter.size)
      .limit(parameter.size).get().then(res => {
      resolve(res);
    })
  })
  return getUser;
}

function getFollowUser(res){
  let getFollowUser = new Promise((resolve,reject) => {
    db.collection("follow").where({
      openid: parameter.openid
    }).get().then(resp => {
      for(let i=0;i<res.data.length;i++){
        if(resp.data[0].followUsers.some(item => item == res.data[i].openid)){
          res.data[i].isFollow = true
        }else{
          res.data[i].isFollow = false
        }
        if(res.data[i].openid == parameter.openid){
          res.data[i].isButton = true
        }else{
          res.data[i].isButton = false
        }
      }
      resolve(res);
    })
  })
  return getFollowUser;
}