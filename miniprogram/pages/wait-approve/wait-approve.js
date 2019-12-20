// pages/collection/collection.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityData: [],
    isLoad: true,
    num: 0,
    size: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('activity').where({
      openid:'o_5hH46kmulxFNrTbOkvHdiEv-wA'
    }).get().then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
    this.getActivity();
  },

  //获取活动数据
  getActivity() {
    let num = 0;
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function (openid) {
        //.all无法在云函数中使用
        db.collection('activity').where({
          signup: db.command.all([openid.data])
        }).field({
          'description.address': true,
          'description.activityTypeName': true,
          'description.endTime': true,
          'description.place': true,
          'description.startTime': true,
          'description.overuptoTime': true,
          'description.uptoTime': true,
          'description.title': true,
          'description.images': true,
          'description.openid': true,
          due: true,
        }).skip(that.data.num * that.data.size)
          .limit(that.data.size)
          .orderBy('due', 'desc')
          .get()
          .then((res) => {
            console.log(res);
            let result = res.data;
            if (result == null || result.length == 0){
              wx.hideLoading();
              return
            }
            for (let i = 0; i < result.length; i++) {
              result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
              result[i].description.overTime = result[i].description.overuptoTime - new Date().getTime();
            };
            db.collection('collectActivity').where({
              openid: openid.data
            }).get().then((resp) => {
              for (let i = 0; i < result.length; i++) {
                if (result.length == 0) {
                  result[i].description.collect = false
                } else {
                  resp.data[0].activityId.some(item => item == result[i]._id)
                    ? (result[i].description.collect = true)
                    : (result[i].description.collect = false)
                }
                db.collection('userInfo').where({
                  openid: result[i].description.openid
                }).field({
                  user: true,
                  perject: true
                }).get().then(userInfo => {
                  if(userInfo.data.length > 0){
                    result[i].description.perject = userInfo.data[0].perject;
                    result[i].description.user = userInfo.data[0].user;
                  }
                  num++
                  if (num === result.length) {
                    wx.hideLoading()
                    if (result.length < 5) { that.setData({ isLoad: false }) };
                    that.data.activityData = that.data.activityData.concat(result);
                    that.setData({ activityData: that.data.activityData })
                  }
                })
              }
            }).catch(err => {
              wx.hideLoading()
              Dialog.alert({ title: `${err}` })
            })
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
    this.getActivity();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})