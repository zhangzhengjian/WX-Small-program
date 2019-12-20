// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter
// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserInfo().then(function(res){
    return follow(res)
  }).then(function(res){
    return getFollowFans(res)
  })
}

function getUserInfo(){
  let getUserInfo = new Promise((resolve, reject) => {
    db.collection('userInfo').where({
      openid: parameter.userid
    }).field({
      perject: true,
      user: true,
      praise:true
    }).get().then(res => {
      resolve(res);
    })
  })
  return getUserInfo;
}

function follow(res){
  let follow = new Promise((resolve, reject) => {
    db.collection('follow').where({
      openid: parameter.openid
    }).get().then(resp => {
      if(resp.data.length == 0){
        res.data[0].isFollow = false;
      }else{
        resp.data[0].followUsers.every( item => item !== parameter.userid)
        ?(res.data[0].isFollow = false)
        :(res.data[0].isFollow = true)
      }
      resolve(res);
    })
  })
  return follow;
}

function getFollowFans(res) {
  let getFollowFans = new Promise((resolve, reject) => {
    db.collection('follow').where({
      openid: parameter.userid
    }).field({followUsers:true}).get().then(resp => {
      if (resp.data.length >= 0) {
        res.data[0].follow = resp.data.length;
      } else {
        res.data[0].follow = 0;
      }
      resolve(res);
    })
  })
  return getFollowFans;
}

