// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

let field = {
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
  due: true
}
// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  if(parameter.type == '0'){
    return getActivity().then(function(res){
      return getCollect(res);
    });
  } else if (parameter.type == '1'){
    return getCollectActivity().then(function(res){
      return getCollect(res);
    });
  } else if (parameter.type == '2') {
    return getCityActivity().then(function (res) {
      return getCollect(res);
    });
  } else if (parameter.type == '3') {
    return getFollowActivity().then(function (res) {
      return getCollect(res);
    });
  } else if (parameter.type == '4') {
    return getMyNewBuiltActivity().then(function (res) {
      return getCollect(res);
    });
  }
}


function getActivity(){
  let getActivity = new Promise((resolve,reject) => {
    db.collection("activity")
    .where({
      'description.overuptoTime': db.command.gt(new Date().getTime()),
      isCancel: false
    })
    .field(field)
    .skip(parameter.num * parameter.size)
    .limit(parameter.size)
    .orderBy('due', 'desc')
    .get().then(res => {
      resolve(res);
    })
  })
  return getActivity;
}

function getCollectActivity(){
  let getCollectActivity = new Promise((resolve,reject) => {
    db.collection("collectActivity").where({
      openid:parameter.openid
    }).get().then(res => {
      db.collection("activity").where({
        _id: db.command.in(res.data[0].activityId),
        'description.overuptoTime': db.command.gt(new Date().getTime())
      })
      .field(field)
      .skip(parameter.num * parameter.size)
      .limit(parameter.size)
      .orderBy('due', 'desc')
      .get().then((res) => {
        resolve(res);
      })
    })
  })
  return getCollectActivity;
}

function getCityActivity(){
  let getCityActivity = new Promise((resolve, reject) => {
    db.collection("activity").where({
      'description.address': db.RegExp({
        regexp: parameter.city,
        options: 'i',
      }),
      'description.overuptoTime': db.command.gt(new Date().getTime())
    })
    .field(field)
    .skip(parameter.num * parameter.size)
    .limit(parameter.size)
    .orderBy('due', 'desc')
    .get().then(res => {
      resolve(res);
    })
  })
  return getCityActivity;
}

function getFollowActivity(){
  let getFollowActivity = new Promise((resolve, reject) => {
    db.collection("follow").where({
      openid:parameter.openid
    }).get().then(res => {
      db.collection("activity").where({
        'description.openid': db.command.in(res.data[0].followUsers),
        'description.overuptoTime': db.command.gt(new Date().getTime())
      })
      .field(field)
      .skip(parameter.num * parameter.size)
      .limit(parameter.size)
      .orderBy('due', 'desc')
      .get().then(res => {
        resolve(res);
      })
    })
  })
  return getFollowActivity;
}

function getMyNewBuiltActivity(){
  let getMyNewBuiltActivity = new Promise((resolve, reject) => {
    db.collection("activity")
      .where({
        'description.openid': parameter.openid,
        'description.overuptoTime': db.command.gt(new Date().getTime()),
        isCancel: false
      })
      .field(field)
      .skip(parameter.num * parameter.size)
      .limit(parameter.size)
      .orderBy('due', 'desc')
      .get().then(res => {
        resolve(res);
      })
  })
  return getMyNewBuiltActivity;
}

function getCollect(res){
  let num = 0;
  if(parameter.openid == undefined){
    parameter.openid = ''
  }
  let getCollect = new Promise((resolve,reject) => {
    db.collection('collectActivity').where({
      openid:parameter.openid
    }).get().then((resp) => {
      for(let i=0;i<res.data.length;i++){
        if(resp.data.length == 0){
          res.data[i].description.collect = false
        }else{
          resp.data[0].activityId.some(item => item == res.data[i]._id)
          ? (res.data[i].description.collect = true)
          : (res.data[i].description.collect = false)
        }
        db.collection('userInfo').where({
          openid: res.data[i].description.openid
        }).field({
          user: true,
          perject: true
        }).get().then(userInfo => {
          if (userInfo.data.length > 0) {
            res.data[i].description.perject = userInfo.data[0].perject;
            res.data[i].description.user = userInfo.data[0].user;
          }
          num++
          if(num === res.data.length){
            resolve(res);
          }
        })
      }
    }).catch(err => {
      resolve(err);
    })
  })
  return getCollect;
}