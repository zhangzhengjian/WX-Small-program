// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
const rp = require('request-promise');
// 初始化 cloud
cloud.init()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  // console.log(event)
  // console.log(context)

  // // 可执行其他自定义逻辑
  // // console.log 的内容可以在云开发云函数调用日志查看

  // // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
    const AccessToken_options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        appid: 'wxe92b6203b3b711fb',
        secret: '4456b91bf2febf845b8afce6dfca5ad1',
        js_code: event.code,
        grant_type: 'authorization_code'
      },
      json: true
    };
    const resultValue = await rp(AccessToken_options);
    return { resultValue }
}
