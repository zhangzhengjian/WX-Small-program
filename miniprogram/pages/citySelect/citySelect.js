// pages/citySelect/citySelect.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var pinyin = require('../../libs/pinyin.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTopId:'A',
    addressItem:[],
    itemTitle:[],
    city:'请选择城市',
    adcode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      adcode: options.adcode,
      city: options.city
    })
    let that = this;
    qqmapsdk = new QQMapWX({
      key: 'MAPBZ-4EK3W-OH4R3-OUBPD-5QND5-67FFO'
    });
    qqmapsdk.getCityList({
      success: function (res) {//成功后的回调
        console.log('城市数据：', res.result[1]); //打印城市数据
        let addressItem = [];
        let itemTitle = [];
        let resp = res.result[1];
        for (var i = 0; i < 26; i++) {
          resp.forEach(item => {
            if (
              String.fromCharCode(65 + i) ==
              that.translateCode(item.name)
            ) {
              var label = that.translateCode(item.name);
              if (addressItem.some(value => value.title == label)) {
                addressItem.forEach(e => {
                  if (e.title == label) {
                    e.content.push(item);
                  }
                });
              } else {
                addressItem.push({ title: label, content: [item] });
              }
            }
          });
        }
        for (let i = 0; i < addressItem.length; i++) {
          itemTitle[i] = addressItem[i].title;
        }
        console.log(addressItem, itemTitle);
        that.setData({
          addressItem: addressItem,
          itemTitle: itemTitle
        })
      },
      fail: function (error) {
        console.error(error);
      }
    });
  },

  selectCity: function(event){
    console.log(event);
    this.setData({
      city:event.currentTarget.dataset.city,
      adcode: event.currentTarget.dataset.adcode
    })
  },

  //获取首字母
  translateCode: function (chinese) {
    for (var key in pinyin) {
      var value = pinyin[key];
      if (value.indexOf(chinese[0]) != -1) {
        return key[0].toUpperCase();
      }
    }
  },
  //点击首字母
  clickLetter: function(event){
    this.setData({
      scrollTopId:event.currentTarget.dataset.id
    })
    console.log(this.data.scrollTopId)
  },

  //确定
  confirm: function (e) {
    let that = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      city: that.data.city,
      adCode: that.data.adcode,
    })
    prevPage.addressEvent(that.data.city, that.data.adcode);
    wx.navigateBack({
      delta: 1
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