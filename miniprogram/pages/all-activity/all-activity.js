// pages/all-activity/all-activity.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData:[],
    isLoad:true,
    num:0,
    size:5,
    tab:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  
  getFormData(type){
    let that = this;
    wx.showLoading({ title: '加载中...' });
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:'getForm',
          data:{
            openid:res.data,
            type:type,
            num:that.data.num,
            size:that.data.size
          }
        }).then(res => {
          wx.hideLoading();
          if (res.result == null) { that.setData({ isLoad: false }); return };
          if (res.result.data.length < 5) { that.setData({ isLoad: false }) }
          if (res.result.errMsg.split(':')[1] == 'ok') {
            let result = res.result.data;
            for(let i=0;i<result.length;i++){
              result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
            }
            that.data.formData = that.data.formData.concat(result);
            that.setData({
              formData: that.data.formData
            })
          } else {
            Dialog.alert({ title: `请求失败！` })
          }
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: `获取数据逻辑异常！` })
        })
      },
    })
  },

  deleteSuccess(){
    Dialog.alert({ title: `删除成功！` }).then(() => {
      this.setData({
        num:0,
        formData:[],
        isLoad:true
      })
      this.getFormData(this.data.tab);

    })
  },

  deleteFail() {
    Dialog.alert({ title: '删除失败！' })
  },

  onChangeTabs(event){
    this.setData({ 
      tab:event.detail.index,
      formData: [],
      isLoad: true,
      num:0
    });
    this.getFormData(event.detail.index);
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
    this.setData({
      formData: [],
      isLoad: true,
      num: 0
    });
    this.getFormData(this.data.tab);
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
    this.getFormData(this.data.tab);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})