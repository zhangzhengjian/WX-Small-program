// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getActivity();
}

function getActivity(){
  let getActivity = new Promise((resolve,reject) => {
     db.collection("activity").where({
       _id: parameter.id,
       'description.openid':parameter.openid
     }).update({
       data:{
         isCancel:true
       }
     }).then(res => {
       resolve(res);
     })
  })
  return getActivity;
}