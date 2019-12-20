// pages/lable/lable.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lableData:['音乐','运动'],
    isFocus:false,
    inputValue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.lable == "undefined" || options.lable == ""
    ?(this.data.lableData = [])
    :(this.data.lableData = options.lable.split(','))
    this.setData({
      lableData:this.data.lableData
    })
  },
  deleteLable(event){
    for(let i=0;i<this.data.lableData.length;i++){
      if(this.data.lableData[i] === event.currentTarget.dataset.lable){
        this.data.lableData.splice(i,1);
      }
    }
    this.setData({
      lableData:this.data.lableData
    })
  },
  ejectInput(){
      if(!this.data.isFocus){
        this.data.lableData.push('');
      }
      this.setData({
        isFocus: !this.data.isFocus,
        lableData: this.data.lableData,
      })
  }, 
  bindKeyInput(event){
    this.data.lableData[this.data.lableData.length-1] = event.detail.value;
    this.setData({
      lableData: this.data.lableData
    })
  },
  bindKeyBlur(){
    for (let i = this.data.lableData.length - 1; i >= 0; i--) {
      if (this.data.lableData[i] == '') {
        this.data.lableData.splice(i, 1);
      }
    }
    this.setData({
      lableData: this.data.lableData,
      isFocus: false,
      inputValue: ''
    })
  },

  signup(){
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    // prevPage.setData({
    //   message: e.currentTarget.dataset.msg,
    // })
    prevPage.getLable(this.data.lableData);
    wx.navigateBack({
      delta: 1,
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