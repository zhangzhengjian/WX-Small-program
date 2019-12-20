// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getActivity().then(function(res){
    if (res == 'true') {
      return addSignUp() 
    } else if(res == 'end') {
      return { title:'报名时间已截止！'}
    } else if(res == 'false') {
      return { title: '您已报名，请勿重复操作！' }
    }
  });
}
function getActivity(){
  let getActivity = new Promise((resolve, reject) => {
     db.collection('activity').where({
       _id: parameter.id,
     }).field({
       signup:true,
       'description.overuptoTime': true
     }).get().then(res => {
       if (res.data[0].description.overuptoTime < new Date().getTime()){
         resolve('end')
         return;
       }
       if (res.data[0].signup.some(item => item == parameter.openid)){
         resolve('false');
       }else{
         resolve('true');
       }
     })
  })
  return getActivity;
}
function addSignUp(){
  let addSignUp = new Promise((resolve,reject) => {
     db.collection('activity').where({
       _id: parameter.id
     }).update({
      data:{
        signup: db.command.push([parameter.openid]),
        newSignup:db.command.push([parameter.openid])
      }
     }).then(res => {
       if (res.stats.updated == 1){
         resolve({title:'报名成功！'});
       }else{
         resolve({title:'报名失败！'});
       }
     }).catch(err => {
       reject(err);
     })
  })
  return addSignUp
}