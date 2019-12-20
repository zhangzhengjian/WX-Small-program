// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return getSaveActivityDetail(event);
}

function getSaveActivityDetail(event) {
  let getSaveActivity = new Promise((resolve, reject) => {
    db.collection("saveActivity").where({
      _id: event.id
    }).get().then(res => {
      resolve(res);
    }).catch(err => {
      resolve(err);
    })
  })
  return getSaveActivity;
}