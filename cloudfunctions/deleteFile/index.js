// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

let parameter

// 云函数入口函数
exports.main = async (event, context) => {
  parameter = event;
  return getUserPhoto().then(function(res){
    return deleteFile()
  })
}

function getUserPhoto(){
  let getUserPhoto = new Promise((resolve,reject) => {
     db.collection("userPhoto").where({
       openid:parameter.openid
     }).field({
       photoAlbum:true
     }).get().then(res => {
       let result = res.data[0].photoAlbum;
       for (let i = result.length-1; i >=0;i--){
         if (parameter.deleteFileArr.some(item => item == result[i].path)){
            result.splice(i,1)
         }
       }
       db.collection("userPhoto").where({
         openid:parameter.openid
       }).update({
         data:{
           photoAlbum:result
         }
       }).then(res => {
         resolve(res);
       })
     })
  })
  return getUserPhoto;
}

function deleteFile(){
  let deleteFile = new Promise((resolve, reject) => {
    resolve(cloud.deleteFile({
      fileList: parameter.deleteFileArr,
    }))
  })
  return deleteFile
}