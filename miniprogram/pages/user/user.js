// pages/user/user.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
   routeType:0,
   fansNum:0,
   userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:'getUserInfo',
          data:{
            openid:res.data,
            userid:res.data
          }
        }).then(resp => {
          console.log(resp);
          if(resp.result !== null){
            that.setData({ userInfo: resp.result.data[0] });
          }
          //获取粉丝数量
          db.collection('follow').where({
            followUsers: db.command.all([res.data])
          }).field({ openid: true }).get().then(res => {
            that.setData({ fansNum: res.data.length });
          })

        }).catch(err => {
          console.log(err);
        })
      },
    })
  },

  goPageLogin(){
    wx.redirectTo({ url: `../login/login` })
  },

  //路由
  personalSpace(){
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if(res.data == ''){
          Dialog.confirm({
            title: `请先完成登录！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({
              url: `/pages/login/login`
            })
          }).catch(() => {})
        }else{
          wx.navigateTo({
            url: `/pages/personal-space/personal-space?openid=${res.data}`
          })
        }
      }
    })
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