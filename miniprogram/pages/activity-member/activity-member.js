// pages/activity-member/activity-member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoData:[],
    value: '',
    num: 0,
    size: 10,
    isLoad: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ value:options.value })
    if (options.id){
      this.getUserInfo(options.id);
    }else if(options.value){
      this.searchUserInfo(options.value);
    }
  },

  getUserInfo(id){
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: "getActivityUsers",
          data: {
            openid: res.data,
            id:id
          }
        }).then(resp => {
          wx.hideLoading();
          for(let i=0;i<resp.result.data.length;i++){
            if(resp.result.data[i].openid == res.data){
              resp.result.data[i].isButton = true
            }
          }
          that.setData({
            userInfoData:resp.result.data
          })
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: err });
        })
      }
    })
  },

  searchUserInfo(value){
    console.log(value);
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: 'searchUserInfo',
          data: {
            value: value,
            num: that.data.num,
            size: that.data.size,
            openid:res.data
          }
        }).then(res => {
          wx.stopPullDownRefresh();
          if (res.result == null) { that.setData({ isLoad: false }); return };
          if (res.result.data.length < 10) { that.setData({ isLoad: false }) }
          that.data.userInfoData = that.data.userInfoData.concat(res.result.data)
          that.setData({
            userInfoData: that.data.userInfoData
          })
          wx.hideLoading();
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: err });
        })
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
    if (!this.data.isLoad) { return };
    this.data.num++
    this.setData({ num: this.data.num });
    this.searchUserInfo(this.data.value);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})