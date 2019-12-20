// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await cloud.downloadFile({
    fileID: event.path,
  })
  const buffer = res.fileContent
  return buffer.toString('utf8')
}