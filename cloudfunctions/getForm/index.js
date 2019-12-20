// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let field = {
    'description.title': true,
    'description.startTime': true,
    'description.endTime': true,
    'description.activityTypeName': true,
    'description.openid': true,
    _id: true,
    due: true
}
// 云函数入口函数
exports.main = async (event, context) => {
  let getForm = new Promise((resolve,reject) => {
    if(event.type == 0){
      db.collection('saveActivity').where({
        'description.openid': event.openid
      }).field(field).skip(event.num * event.size).limit(event.size).orderBy('due', 'desc').get().then(res => {
        res.data.forEach(item => {
          item.state = event.type;
        })
        resolve(res);
      }).catch(err => {
        resolve(err);
      })
    }else if(event.type == 1){
      db.collection('activity').where({
        'description.openid': event.openid,
        'description.overdueTime': db.command.lt(new Date().getTime())
      }).field(field).skip(event.num * event.size).limit(event.size).orderBy('due', 'desc').get().then(res => {
        res.data.forEach(item => {
          item.state = event.type;
        })
        resolve(res);
      }).catch(err => {
        resolve(err);
      })
    }else if(event.type == 2){
      db.collection('activity').where({
        'description.openid': event.openid
      }).field(field).skip(event.num * event.size).limit(event.size).orderBy('due', 'desc').get().then(res => {
        res.data.forEach(item => {
          item.state = event.type;
        })
        resolve(res);
      }).catch(err => {
        resolve(err);
      })
    } else if (event.type == 3) {
      db.collection('activity').where({
        'description.openid': event.openid,
        'description.overuptoTime': db.command.gt(new Date().getTime()),
        isCancel:false
      }).field(field).skip(event.num * event.size).limit(event.size).orderBy('due', 'desc').get().then(res => {
        res.data.forEach(item => {
          item.state = event.type;
        })
        resolve(res);
      }).catch(err => {
        resolve(err);
      })
    }
  })

  return getForm.then(function(data){
    return data
  })
}