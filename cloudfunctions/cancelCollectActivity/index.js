// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let getCollectActivity = new Promise((resolve,reject) => {
    db.collection('collectActivity').where({
      openid:event.openid
    }).get().then((res) => {
      resolve(res);
    })
  })
  return getCollectActivity.then( function(data) {
     for(let i=0;i<data.data[0].activityId.length;i++){
       if (event.id == data.data[0].activityId[i]){
         data.data[0].activityId.splice(i,1);
           return addActivity(data);
       }
     }
  })
  function addActivity(data){
    let collect = new Promise((resolve,reject) => {
      db.collection('collectActivity').where({
        openid: event.openid
      }).update({
        data: {
          activityId: db.command.set(data.data[0].activityId)
        }
      }).then(res => {
        resolve(res);
      }).catch(err => {
        resolve(err);
      })
    })
    return collect
  }
}