// pages/address/address.js
var postsData = require('./area-list.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    areaList: postsData.postList,//省市区数据
    address: '',//省市区名称
    areaCode:'',//上页面传递来的省市区code
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      areaCode: options.areaCode,
      address: options.address
    })
  },
  //点击
  change: function (e){
    console.log(e);
    // let address = "";
    // for(let i=0;i<e.detail.values.length;i++){
    //   address += e.detail.values[i].name + '/';
    // }
    // address = address.substring(0, address.length - 1);
    // this.setData({
    //   address:address,
    //   areaCode:'',
    //   code: e.detail.values[e.detail.values.length - 1].code
    // })
  },
  //确定
  confirm: function(e){
    let address = "";
    for(let i=0;i<e.detail.values.length;i++){
      address += e.detail.values[i].name + '/';
    }
    address = address.substring(0, address.length - 1);
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      address: address,
      areaCode: e.detail.values[e.detail.values.length - 1].code
    })
    prevPage.addressEvent(address, e.detail.values[e.detail.values.length - 1].code);
    wx.navigateBack({
      delta: 1
    })
  },
  //取消
  cancel: function(e){
    wx.navigateBack({
      delta:1
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