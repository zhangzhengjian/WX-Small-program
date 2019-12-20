// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return searchActivity().then(function(res){
    return collectActivity(res);
  }).then(function(res){
    return getUserInfo(res);
  }).then(function(res){
    return getUser(res);
  })
}

function searchActivity(){
  let searchAct = new Promise((resolve,reject) => {
    db.collection('activity').where({
      'description.title': db.RegExp({
        regexp: parameter.value,
        options: 'i',
      }),
      'description.overuptoTime': db.command.gt(new Date().getTime())
    }).field({
      'description.address': true,
      'description.activityTypeName': true,
      'description.endTime': true,
      'description.place': true,
      'description.startTime': true,
      'description.overuptoTime': true,
      'description.uptoTime': true,
      'description.title': true,
      'description.images': true,
      'description.openid': true,
      due: true,
      }).skip(parameter.num * parameter.size)
      .limit(parameter.size).orderBy('due', 'desc').get().then(res => {
      resolve(res);
    })
  })
  return searchAct;
}

function collectActivity(res){
  let collectAct = new Promise((resolve,reject) => {
    db.collection('collectActivity').where({
      openid: parameter.openid
    }).get().then((resp) => {
      for (let i = 0; i < res.data.length; i++) {
        if(resp.data.length > 0){
          resp.data[0].activityId.some(item => item == res.data[i]._id)
            ? (res.data[i].description.collect = true)
            : (res.data[i].description.collect = false)
        }else{
          res.data[i].description.collect = false
        }
      }
      resolve(res);
    })
  })
  return collectAct;
}

function getUserInfo(res){
  let num = 0;
  let getUserInfo = new Promise((resolve,reject) => {
    for (let i = 0; i < res.data.length; i++) {
    db.collection('userInfo').where({
      openid: res.data[i].description.openid
    }).field({
      user: true,
      perject: true
      }).skip(0)
      .limit(10).get().then(userInfo => {
      res.data[i].description.perject = userInfo.data[0].perject;
      res.data[i].description.user = userInfo.data[0].user;
      num++
      if (num === res.data.length) {
        resolve(res);
      }
    })
    }
    if (res.data.length == 0){
      resolve(res);
    }
  })
  return getUserInfo;
}

function getUser(res){
  let getUser = new Promise((resolve,reject) => {
    db.collection('userInfo').where({
      'user.nickName': db.RegExp({
        regexp: parameter.value,
        options: 'i',
      })
    }).field({
      'user.nickName': true,
      'user.avatarUrl': true,
      openid:true
      }).limit(10).get().then(user => {
      res.userData = user
      resolve(res);
    })
  })
  return getUser;
}