// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getActivityDetail(event).then(function (res) {
    if(res.data == 0){
      return res
    }else{
      return getUserInfo(res);
    }
  }).then(function(res){
    if(res.data == 0){
      return res
    }else{
      return getUserActivity(res);
    }
  })
}

function getActivityDetail() {
  let getActivity = new Promise((resolve, reject) => {
    db.collection("activity").where({
      _id: parameter.id
    }).get().then(res => {
      if(res.data.length == 0){
        resolve(res);
        return;
      }
      res.data[0].description.openid === parameter.openid
      ? (res.data[0].description.isFooter = false)
      : (res.data[0].description.isFooter = true)
      res.data[0].signup.some(item => item == parameter.openid) || res.data[0].agree.some(item => item == parameter.openid)
      ? (res.data[0].description.isSignUp = true)
      : (res.data[0].description.isSignUp = false)
      if(res.data[0].description.overdueTime < new Date().getTime()){
        res.data[0].isCancel = true;
      }
      res.data[0].description.agreeNum = res.data[0].agree.length
      delete res.data[0].signup;
      delete res.data[0].agree;
      resolve(res);
    }).catch(err => {
      resolve(err);
    })
  })
  return getActivity;
}

function getUserInfo(res){
  let num = 0;
  let getUser = new Promise((resolve,reject) => {
    for (let i = 0; i < res.data.length; i++) {
      db.collection('userInfo').where({
        openid: res.data[i].description.openid
      }).field({
        user: true,
        perject: true
      }).get().then(userInfo => {
        res.data[i].description.perject = userInfo.data[0].perject;
        res.data[i].description.user = userInfo.data[0].user;
        num++
        if (num === res.data.length) {
          resolve(res);
        }
      })
    }
  })
  return getUser;
}

function getUserActivity(res){
  let getUserActivity = new Promise((resolve,reject) => {
    db.collection("userActivity").where({
      openid:parameter.openid
    }).get().then(resp => {
      if(resp.data.length > 0){
        if (resp.data[0].agreeActivityId.some(item => item == res.data[0]._id)) {
          res.data[0].description.isAdopt = true
        } else {
          res.data[0].description.isAdopt = false
        }
      }else{
        res.data[0].description.isAdopt = false
      }
      resolve(res);
    })
  })
  return getUserActivity;
}

// function getFollow(res){
//   let getFollow = new Promise((resolve,reject) => {
//     db.collection("follow").where({
//       openid:parameter.openid
//     }).field({
//       followUsers:true
//     }).get().then(resp => {
//       if(resp.data[0].followUsers.some( item => res.data[0].description.openid)){
//         res.data[0].description.isFollow = true
//       }else{
//         res.data[0].description.isFollow = false
//       }
//       resolve(res);
//     })
//   })
//   return getFollow;
// }

