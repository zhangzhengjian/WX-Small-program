// pages/already-signup/already-signup.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityData:[],
    isLoad:true,
    tab:0,
    num:0,
    size:5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSignupActivity(this.data.tab);
  },

  onChangeTabs(event){
    this.setData({
      tab:event.detail.index,
      activityData:[],
      isLoad:true,
      num:0
    })
    this.getSignupActivity(event.detail.index)
  },

  getSignupActivity(type){
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:"getSignupActivity",
          data:{
            openid:res.data,
            type:type,
            num:that.data.num,
            size:that.data.size
          }
        }).then(res => {
          console.log(res);
          wx.hideLoading()
          if (res.result == null) { that.setData({ isLoad: false }); return };
          if (res.result.data.length < 5) { that.setData({ isLoad: false }) };
          let result = res.result.data;
          for (let i = 0; i < result.length; i++) {
            result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
            result[i].description.overTime = result[i].description.overuptoTime - new Date().getTime();
          }
          that.data.activityData = that.data.activityData.concat(result);
          that.setData({
            activityData: that.data.activityData 
          })
        }).catch(err => {
          wx.hideLoading()
          Dialog.alert({ title: `${err}` })
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
    this.getSignupActivity(this.data.tab);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})