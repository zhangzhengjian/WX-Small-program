// pages/login/login.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.activityId){
      this.setData({ activityId: options.activityId });
    }else{
      this.setData({ activityId: null });
    }
    // let that = this;
    // wx.getSetting({
    //   success(resp) {
    //     if(resp.authSetting['scope.userInfo']){//已授权则跳转到首页
    //       wx.cloud.callFunction({
    //         name: 'login',
    //         data: {},
    //         success: res => {
    //           // app.globalData.openid = res.result.openid
    //           wx.setStorage({
    //             key: 'openid',
    //             data: res.result.openid
    //           })
    //           wx.switchTab({ url: '/pages/index/index' });
    //         }
    //       })
    //       // wx.checkSession({//判断用户权限是否过期
    //       //   success() {
    //       //     console.log('未过期');
    //       //     wx.switchTab({ url: '/pages/index/index' });
    //       //   },
    //       //   fail() {
    //       //     console.log('过期')
    //       //     // 调用云函数,储存用户ID
    //       //     wx.cloud.callFunction({
    //       //       name: 'login',
    //       //       data: {},
    //       //       success: res => {
    //       //         // app.globalData.openid = res.result.openid
    //       //         wx.setStorage({
    //       //           key: 'openid',
    //       //           data: res.result.openid
    //       //         })
    //       //         wx.switchTab({ url: '/pages/index/index' });
    //       //       }
    //       //     })
    //       //   }
    //       // })
    //     }
    //   }
    // })
  },

  bindgetuserinfo: function (e) {
    let that = this;
    if (e.detail.userInfo) {
      wx.showLoading({ title: '加载中...' })
      wx.login({
        success: res => {
          wx.cloud.callFunction({
            name: 'login',
            data: { code: res.code }
          }).then(res => {
            try {
              wx.setStorageSync('openid', res.result.resultValue.openid)
            } catch (e) { };
            try {
              wx.setStorageSync('session_key', res.result.resultValue.session_key)
            } catch (e) { };
            wx.getUserInfo({//储存当前小程序用户数据
              success: function (userInfo) {
                wx.cloud.callFunction({
                  name: 'userInfo',
                  data: {
                    user: userInfo.userInfo,
                    openid: res.result.resultValue.openid
                  }
                }).then(res => {
                  wx.hideLoading();
                  wx.reLaunch({ url: `/pages/index/index?activityId=${that.data.activityId}` });
                }).catch(err => {
                  wx.hideLoading();
                  Dialog.alert({ title: `${err}` })
                })
                wx.setStorage({
                  key: "userInfo",
                  data: userInfo.userInfo
                })
              }
            })
          })
        }
      })

    } else {
      console.log("点击了拒绝授权");
    }
  },
  //暂不登录
  goPageIndex(){
    try {
      wx.setStorageSync('openid', '')
    } catch (e) { };
    wx.reLaunch({ url: `/pages/index/index?activityId=${this.data.activityId}&loginType=tourist` });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})