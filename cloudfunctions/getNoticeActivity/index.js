// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserActivity().then(function(res){
    return getActivity(res);
  }).then(function(res){
    return removeNewActivity(res);
  })
}

function getUserActivity(){
  let getUserActivity = new Promise((resolve, reject) => {
    db.collection("userActivity").where({
      openid:parameter.openid
    }).get().then(res => {
      if(parameter.type == 0){
        resolve(res.data[0].agreeActivityId)
      }else{
        resolve(res.data[0].refuseActivityId)
      }
    })
  })
  return getUserActivity;
}

function getActivity(res) {
  let getActivity = new Promise((resolve, reject) => {
      db.collection("activity").where({
        _id: db.command.in(res)
      }).field({
        'description.title': true,
        'description.startTime': true,
        'description.endTime': true
      }).get().then(resp => {
        resolve(resp)
      })
  })
  return getActivity;
}

function removeNewActivity(res) {
  let removeNewActivity = new Promise((resolve, reject) => {
    db.collection("userActivity").where({
      openid: parameter.openid
    }).update({
      data: {
        newAgreeActivityId: [],
        newRefuseActivityId:[]
      }
    }).then(resp => {
      resolve(res);
    })
  })
  return removeNewActivity;
}