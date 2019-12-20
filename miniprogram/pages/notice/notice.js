// pages/notice/notice.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId:[],
    activityData:[],
    isLoad: true,
    tab: 0,
    num: 0,
    size: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activityId: JSON.parse(options.noticeData)
    })
    console.log(JSON.parse(options.noticeData))
    this.getActivity(this.data.tab);
  },

  onChangeTabs(event) {
    this.setData({
      tab: event.detail.index,
      activityData: [],
      isLoad: true,
      num: 0
    });
    this.getActivity(event.detail.index);
  },

  getActivity(type){
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: "getNoticeActivity",
          data: {
            openid: res.data,
            type: type,
            num: that.data.num,
            size:that.data.size
          }
        }).then(res => {
          wx.hideLoading();
          let newActivityId = [];
          if (res.result == null) { that.setData({ isLoad: false }); return };
          if (res.result.data.length < 5) { that.setData({ isLoad: false }) }
          let result = res.result.data
          type == 0
          ?(newActivityId = that.data.activityId.newAgreeActivityId)
          :(newActivityId = that.data.activityId.newRefuseActivityId)
          result.forEach( item => {
            if(newActivityId.some( i => i == item._id)){
              item.isNewActivity = true;
            }else{
              item.isNewActivity = false;
            }
          })
          that.data.activityData = that.data.activityData.concat(result);
          that.setData({
            activityData: that.data.activityData
          })
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: `${err}` })
        })
      }
    })
  },

  goPage(event){
    wx.navigateTo({
      url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}`
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