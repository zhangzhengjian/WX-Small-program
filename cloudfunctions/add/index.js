// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database();

let parameter
// 云函数入口函数
exports.main = async(event, context) => {
  parameter = event;
  return addActivity().then(function(res) {
    return removeActivity(res);
  })
}

function addActivity() {
  let addActivity = new Promise((resolve, reject) => {
    let overstartTime = new Date(parameter.activityData.startTime);
    let overdueTime = new Date(parameter.activityData.endTime);
    let overuptoTime = new Date(parameter.activityData.uptoTime);
    parameter.activityData.overstartTime = overstartTime.setHours(overstartTime.getHours() - 8);
    parameter.activityData.overdueTime = overdueTime.setHours(overdueTime.getHours() - 8);
    parameter.activityData.overuptoTime = overuptoTime.setHours(overuptoTime.getHours() - 8);
    db.collection('activity').add({
      data: {
        description: parameter.activityData,
        isCancel: false,
        due: new Date(),
        signup: [],
        newSignup: [],
        agree: []
      }
    }).then(res => {
      resolve(res);
    })
  })
  return addActivity
}

function removeActivity(res) {
  let removeActivity = new Promise((resolve, reject) => {
    db.collection("saveActivity").where({
      _id: parameter.id
    }).remove().then(resp => {
      resolve(res);
    })
  })
  return removeActivity;
}