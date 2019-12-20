// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  event.activityData.overdueTime = new Date(event.activityData.endTime).getTime();
  let getSave =  new Promise((resolve,reject) => {
    db.collection('saveActivity').where({
      _id:event.id,
      'description.openid':event.openid
    }).update({
      data:{
        description: event.activityData,
        due: new Date(),
      }
    }).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    })
  })
  return getSave.then( function(data){
    if(data.stats.updated == 0){
      let addSave = new Promise((resolve,reject) => {
        db.collection('saveActivity').add({
          data: {
            description: event.activityData,
            due: new Date(),
          },
        }).then(res => {
          resolve(res);
        })
      })
      return addSave
    }else{
      return data
    }
  })
}