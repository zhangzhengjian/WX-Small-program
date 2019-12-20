// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getActivity().then(function (res) {
    return getUserInfo(res);
  }).then(function(res){
    return getFollow(res)
  })
}

function getActivity() {
  let getActivity = new Promise((resolve, reject) => {
    db.collection('activity').where({
      _id: parameter.id
    }).field({ agree: true }).get().then(res => {
      resolve(res.data[0].agree);
    })
  })
  return getActivity;
}

function getUserInfo(res) {
  let getUserInfo = new Promise((resolve, reject) => {
    db.collection('userInfo').where({
      openid: db.command.in(res)
    }).field({
      'user.nickName': true,
      'user.avatarUrl': true,
      'user.city': true,
      'perject.age': true,
      'perject.sex': true,
      openid: true
    }).get().then(resp => {
      resolve(resp)
    })
  })
  return getUserInfo;
}

function getFollow(res) {
  let getFollow = new Promise((resolve, reject) => {
    db.collection('follow').where({
      openid: parameter.openid
    }).field({ followUsers: true }).get().then(resp => {
      for(let i=0;i<res.data.length;i++){
        if(resp.data.length > 0){
          if (resp.data[0].followUsers.some(item => item == res.data[i].openid)) {
            res.data[i].isFollow = true
          } else {
            res.data[i].isFollow = false
          }
        }else{
          res.data[i].isFollow = false
        }
      }
      resolve(res);
    })
  })
  return getFollow;
}