// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let collectActivity = new Promise((resolve,reject) => {
    db.collection('collectActivity').where({
      openid: event.openid
    }).update({
      data: {
        activityId: db.command.push(event.id)
      },
    }).then((res) => {
      if(res.stats.updated == 0){
        db.collection('collectActivity').add({
          data:{
            activityId: [event.id],
            openid:event.openid
          }
        }).then(resp => {
          resolve(resp);
        }).catch(err => {
          resolve(err);
        })
      }else{
        resolve(res);
      }
    }).catch(err => {
      resolve(err);
    })
  });
  return collectActivity.then(function(data){
    return data
  })
}
