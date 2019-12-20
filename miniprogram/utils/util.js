function getUserInfo(){
  return new Promise((resolve,reject) => {
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log(res);
        wx.cloud.callFunction({
          name: 'getUserInfo',
          data: {
            openid: res.data,
            userid: res.data
          }
        }).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      },
    })
  })
}

module.exports = {
  getUserInfo: getUserInfo
}