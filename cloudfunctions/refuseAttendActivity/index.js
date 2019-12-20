// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserActivity().then(function (res) {
    return getActivity();
  }).then(function (res) {
    return updateActivity(res);
  })
}

function getUserActivity() {
  let getUserActivity = new Promise((resolve, reject) => {
    db.collection("userActivity").where({
      openid: parameter.userid
    }).update({
      data: {
        refuseActivityId: db.command.unshift([parameter.id]),
        newRefuseActivityId: db.command.unshift([parameter.id])
      }
    }).then(res => {
      if (res.stats.updated == 0) {
        db.collection("userActivity").add({
          data: {
            openid: parameter.userid,
            refuseActivityId: [parameter.id],
            newRefuseActivityId: [parameter.id],
            agreeActivityId:[],
            newAgreeActivityId:[]
          }
        }).then(res => {
          resolve(res);
        })
      } else {
        resolve(res);
      }
    })
  })
  return getUserActivity;
}

function getActivity() {
  let getActivity = new Promise((resolve, reject) => {
    db.collection("activity").where({
      _id: parameter.id
    }).field({
      signup: true
    }).get().then(res => {
      for (let i = res.data[0].signup.length - 1; i >= 0; i--) {
        if (res.data[0].signup[i] == parameter.userid) {
          res.data[0].signup.splice(i, 1);
        }
      }
      resolve(res);
    })
  })
  return getActivity;
}

function updateActivity(event) {
  let updateActivity = new Promise((resolve, reject) => {
    db.collection("activity").where({
      _id: parameter.id
    }).update({
      data: {
        signup: event.data[0].signup
      }
    }).then(res => {
      resolve(res);
    })
  })
  return updateActivity;
}