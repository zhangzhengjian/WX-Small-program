// pages/search/search.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    num: 0,
    size: 4,
    isRecord: true,
    isUser: false,
    isLoad:true,
    searchRecord:[],
    activityData: [],
    userData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSearchRecord();
  },

  //获取搜索记录
  getSearchRecord(){
    let that = this;
    wx.getStorage({
      key: 'searchRecord',
      success: function (res) {
        that.setData({ searchRecord: res.data })
      },
      fail: err => {
        wx.setStorage({
          key: 'searchRecord',
          data: [],
          success: res => {
            console.log('新增成功')
          }
        })
      }
    })
  },
  getActivityData(value){
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.showLoading({ title: '加载中...' })
        wx.cloud.callFunction({
          name: 'searchActivity',
          data: {
            value: value,
            num: that.data.num,
            size: that.data.size,
            openid: res.data
          }
        }).then(res => {
          wx.hideLoading()
          if(res.result.userData){
            res.result.userData.data.length < 10
            ?(that.data.isUser = false)
            :(that.data.isUser = true)
          }
          wx.stopPullDownRefresh();
          let result = res.result.data;
          if (result.length < 4) { that.setData({ isLoad: false }) }
          for (let i = 0; i < result.length; i++) {
            result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
            result[i].description.overTime = result[i].description.overuptoTime - new Date().getTime();
          }
          that.data.activityData = that.data.activityData.concat(result)
          that.setData({
            activityData: that.data.activityData,
            userData: res.result.userData.data,
            isUser:that.data.isUser
          })
        }).catch(err => {
          wx.hideLoading()
          Dialog.alert({ title: `${err}` })
        })
      },
    })
  },
  onSearch(){
    if(this.data.value !== ''){
      this.setData({ 
        isRecord: false,
        isUser: false,
        isLoad: true,
        num:0,
        size:5,
        activityData:[],
        userData:[]
      })
      this.getActivityData(this.data.value);
      //历史搜索存储在storage
      for (let i = 0; i < this.data.searchRecord.length; i++) {
        if (this.data.searchRecord[i] == this.data.value) {
          this.data.searchRecord.splice(i, 1)
        }
      }
      this.data.searchRecord.unshift(this.data.value);
      wx.setStorage({
        key: 'searchRecord',
        data: this.data.searchRecord.slice(0,10)
      })
    }else{
      this.setData({ isRecord: true })
    }
  },

  onChange(event){
    console.log(event);
    if (event.detail == ''){
      this.getSearchRecord();
      this.setData({ value: event.detail, isRecord: true })
    }else{
      this.setData({ value: event.detail })
    }
  },

  onClear(){
    this.getSearchRecord();
    this.setData({ value:'', isRecord: true });
  },

  clickRecord(event){
    this.setData({ value: event.currentTarget.dataset.value })
    this.onSearch();
  },

  //跳转到成员列表
  goPageMember(event) {
    wx.navigateTo({
      url: `/pages/activity-member/activity-member?value=${event.currentTarget.dataset.value}`
    })
  },
  //进入空间
  goPageSpace(event) {
    wx.navigateTo({
      url: `/pages/personal-space/personal-space?openid=${event.currentTarget.dataset.userid}`
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
    this.getActivityData(this.data.value);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})