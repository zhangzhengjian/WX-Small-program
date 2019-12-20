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

function getUserPhoto(){
  let getUserPhoto = new Promise((resolve,reject) => {
    db.collection("userPhoto").where({
      openid:parameter.userid
    }).field({
      photoAlbum:true,
      type:true
    }).get().then(res => {
      if (res.data.length > 0){
        if (res.data[0].type == '1' && parameter.userid !== parameter.openid) {
          res.data[0].photoAlbum = [];
        }
      }else{
        res.data = [{ photoAlbum :[] }];
      }
      resolve(res);
    })
  })
  return getUserPhoto;
}