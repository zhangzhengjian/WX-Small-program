// pages/subscribe/subscribe.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    tips: '',
    buttonText: '',
    tmplIds: [],
    pageIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if (options.type == 'release') {
      this.setData({
        type: '发布成功',
        tips: '请注意小伙伴的报名申请哦~',
        buttonText: '推送报名信息',
        tmplIds: ['ZfGnadQelwCl4VcXkAYBvb5JiQtXXX7abV7JyQ5PIFs'],
        pageIndex: 2
      })
    } else if (options.type == 'signup') {
      this.setData({
        type: '报名成功',
        tips: '请耐心等待主办人审核哦~',
        buttonText: '推送审核结果',
        tmplIds: ['BTmSQ1qoRxdXBaxY-KSDFddnquKiIrCrvkUlNBXOkMM', '7rmRkeHCN4L0DrrTN9CybioxEoTQBjVMs3htRSYNhR8'],
        pageIndex: 1
      })
    }
  },

  subscribe(event) {
    let that = this;
    console.log(that.data.tmplIds);
    wx.requestSubscribeMessage({
      tmplIds: that.data.tmplIds,
      success(res) {
        console.log(res);
        if (res[Object.keys(res)[0]] == 'accept') {
          wx.navigateBack({
            delta: that.data.pageIndex
            // success: function () {
            //   let eventChannel = that.getOpenerEventChannel()
            //   eventChannel.emit('someEvent');
            // }
          });
        } else {
          wx.navigateBack({
            delta: that.data.pageIndex
          });
        }
      },
      fail(err) {
        console.log(err);
      }
    })
  },

  refuse: function() {
    wx.navigateBack({
      delta: this.data.pageIndex
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})