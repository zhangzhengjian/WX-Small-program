// pages/follow/follow.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.followTab();
  },

  followTab(){
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:'getFollow',
          data:{
            openid:res.data
          }
        }).then(res => {
          console.log(res);
          wx.hideLoading();
          that.setData({
            userInfoData: res.result.data
          })
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: `${err}` })
        })
      },
    })
  },

  fansTab(){
    let that = this;
    wx.showLoading({ title: '加载中...' })
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.getFans(res.data).then(function (res) {
          wx.hideLoading();
          that.setData({
            userInfoData:res
          })
        },function(err){
          wx.hideLoading();
          Dialog.alert({ title: `${err}` })
        })
      },
    })
  },

  onChangeTabs(event) {
    if (event.detail.index == 0){
      this.followTab();
    } else if (event.detail.index == 1) {
      this.fansTab();
    }
  },
  //获取粉丝数据，.all无法在云函数中使用，只能在前端请求数据
  getFans(openid){
    let fans = [];
    let num = 0;
    return new Promise((resolve,reject) => {
      db.collection('follow').where({
        followUsers: db.command.all([openid])
      }).field({ openid: true }).get().then(resOne => {
        if(resOne.data.length > 0){
        for (let i = 0; i < resOne.data.length; i++) {
          db.collection('userInfo').where({
            openid: resOne.data[i].openid
          }).field({
            'user.nickName': true,
            'user.avatarUrl': true,
            'user.city': true,
            'perject.age': true,
            'perject.sex': true,
            openid:true
          }).get().then(resTwo => {
            db.collection('follow').where({
              openid:openid
            }).field({
              followUsers:true
            }).get().then(resThree => {
              if (resThree.data.length !== 0){
              if (resThree.data[0].followUsers.some(item => item == resTwo.data[0].openid)){
                resTwo.data[0].isFollow = true
              }else{
                resTwo.data[0].isFollow = false
              }
              }else{
                resTwo.data[0].isFollow = false
              }
              fans.push(resTwo.data[0]);
              num++
              if (num == resOne.data.length) { resolve(fans) }
              }).catch(err => { reject(err) })
            }).catch(err => { reject(err) })
        }
        }else{
          resolve(fans);
        }
      }).catch(err => { reject(err) })
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