// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter
// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return follow();
}

function follow(){
  let follow = new Promise((resolve,reject) => {
    db.collection('follow').where({
      openid: parameter.openid
    }).get().then(res => {
      if (res.data.length == 0) {
        db.collection('follow').add({
          data: {
            openid: parameter.openid,
            followUsers: [parameter.userid]
          }
        }).then(res => { resolve(res) })
      }else{
        if (res.data[0].followUsers.every(item => item !== parameter.userid)) {
          res.data[0].followUsers.unshift(parameter.userid);
        } else {
          for (let i = 0; i < res.data[0].followUsers.length; i++) {
            if (res.data[0].followUsers[i] == parameter.userid) {
              res.data[0].followUsers.splice(i, 1);
            }
          }
        }
        db.collection('follow').where({
          openid: parameter.openid
        }).update({
          data: {
            followUsers: res.data[0].followUsers
          }
        }).then(res => { resolve(res) })
      }
    })
  })
  return follow;
}
