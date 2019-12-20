// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getuserActivity().then(function(res){
    return getActivity(res);
  });
}

function getuserActivity(){
  let getuserActivity = new Promise((resolve,reject) => {
     db.collection("userActivity").where({
       openid:parameter.openid
     }).get().then(res => {
       if(res.data.length > 0){
         if (parameter.type == 0) {
           resolve(res.data[0].refuseActivityId)
         } else if (parameter.type == 1) {
           resolve(res.data[0].agreeActivityId)
         }
       }else{
         resolve([])
       }
     })
  })
  return getuserActivity
}

function getActivity(res){
  let num = 0;
  let getActivity = new Promise((resolve, reject) => {
      db.collection("activity").where({
        _id: db.command.in(res)
      }).field({
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
        due: true,
        }).skip(parameter.num).limit(parameter.size).orderBy('due', 'desc').get().then((res) => {
        db.collection('collectActivity').where({
          openid: parameter.openid
        }).get().then((resp) => {
          for (let i = 0; i < res.data.length; i++) {
            if (resp.data.length == 0) {
              res.data[i].description.collect = false
            } else {
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
              res.data[i].description.perject = userInfo.data[0].perject;
              res.data[i].description.user = userInfo.data[0].user;
              num++
              if (num === res.data.length) {
                resolve(res);
              }
            })
          }
        }).catch(err => {
          resolve(err);
        })
      })
  })
  return getActivity
}