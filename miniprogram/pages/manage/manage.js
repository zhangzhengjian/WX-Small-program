// pages/manage/manage.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData:[],
    num:0,
    size:5,
    isLoad: true,
    deviceHeight: wx.getSystemInfoSync().windowHeight,
    imageHeight: ((wx.getSystemInfoSync().windowWidth-20)/480)*152,
    height:300
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  goPage: function(event){
    let that = this;
    switch (event.currentTarget.dataset.type){
      case 'add':
      wx.navigateTo({
        url: `/pages/add/add`
        // events: {
        //   someEvent: function () {//事件订阅
        //     that.getMyNewBuiltActivity();
        //   }
        // },
      })
      break;
      case 'wait-approve':
      wx.navigateTo({
        url: `/pages/wait-approve/wait-approve`
      })
      break;
      case 'sign':
      wx.navigateTo({
        url: `/pages/already-signup/already-signup`
      })
      break;
      case 'all':
      wx.navigateTo({
        url: `/pages/all-activity/all-activity`
      })
      break;
    }
  },

  getMyNewBuiltActivity(){
      let that = this;
      wx.showLoading({ title: '加载中...' });
      wx.getStorage({
        key: 'openid',
        success: function (res) {
          wx.cloud.callFunction({
            name: 'getForm',
            data: {
              openid: res.data,
              type: 3,
              num: that.data.num,
              size: that.data.size
            }
          }).then(res => {
            var query = wx.createSelectorQuery();
            query.select('.banner').boundingClientRect(function (res) {
              that.data.height =
              that.data.deviceHeight
              - res.height
              - 20
              - 22
              - 10;
              that.setData({
                height:that.data.height
              })
            }).exec();
            wx.hideLoading();
            if (res.result == null) { that.setData({ isLoad: false }); return };
            if (res.result.data.length < 5) { that.setData({ isLoad: false }) }
            if (res.result.errMsg.split(':')[1] == 'ok') {
              let result = res.result.data;
              for (let i = 0; i < result.length; i++) {
                result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
              }
              that.data.formData = that.data.formData.concat(result);
              that.setData({
                formData: that.data.formData
              })
            } else {
              console.log(res);
            }
          }).catch(err => {
            wx.hideLoading();
            console.log(err);
          })
        },
      })
  },

  deleteSuccess() {
    Dialog.alert({ title: `删除成功！` }).then(() => {
      this.setData({
        num: 0,
        formData: [],
        isLoad: true
      })
      this.getMyNewBuiltActivity();
    })
  },

  deleteFail() {
    Dialog.alert({ title: '删除失败！' })
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
    this.getMyNewBuiltActivity();
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
  scrolltolower: function () {
    if (!this.data.isLoad) { return };
    this.data.num++
    this.setData({ num: this.data.num });
    this.getMyNewBuiltActivity();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})