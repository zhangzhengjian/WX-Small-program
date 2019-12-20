// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return deleteActivity(event)
}

function deleteActivity(event){
  let collection = 'activity';
  if (event.state == 0) { collection = 'saveActivity' };
  let deleteAct = new Promise((resolve,reject) => {
     db.collection(collection).where({
       'description.openid': event.openid,
       _id:event.id
     }).remove().then(res => {
       resolve(res);
     })
  })
  return deleteAct
}