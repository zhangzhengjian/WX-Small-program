// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter
// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getActivity().then(function(res){
    return removeNewSignup(res)
  });
}

function getActivity(){
  let getActivity = new Promise((resolve,reject) => {
    db.collection("activity").where({
      'description.openid':parameter.openid
    }).field({
      signup:true,
      'description.title': true,
      'description.startTime': true,
      'description.place': true,
      'description.place': true,
    }).get().then(res => {
      let activity = [];
      for (let i = 0; i < res.data.length; i++){
         if(res.data[i].signup.length > 0){
           activity.push(res.data[i]);
         }
      }
      res.data = activity
      resolve(res);
    })
  })
  return getActivity;
}

function removeNewSignup(res){
  let removeNewSignup = new Promise((resolve, reject) => {
     db.collection("activity").where({
       'description.openid': parameter.openid
     }).update({
       data:{
         newSignup:[]
       }
     }).then(resp => {
        resolve(res);
     })
  })
  return removeNewSignup;
}