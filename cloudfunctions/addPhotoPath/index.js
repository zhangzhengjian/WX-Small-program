// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserPhoto();
}

function  getUserPhoto(){
  let getUserPhoto = new Promise((resolve,reject) => {
     db.collection("userPhoto").where({
       openid:parameter.openid
     }).update({
       data:{
          photoAlbum: db.command.unshift([{
            path:parameter.path,
            type:parameter.type,
            upLoadTime: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
          }])
       }
     }).then(res => {
       if(res.stats.updated == 0){
         db.collection("userPhoto").add({
           data:{
              openid: parameter.openid,
              type:'0',
              photoAlbum: [{
                path: parameter.path,
                type: parameter.type,
                upLoadTime: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
              }]
           }
         }).then(resp => {
           resolve(resp);
         })
       }else{
         resolve(res);
       }
     })
  })
  return getUserPhoto;
}