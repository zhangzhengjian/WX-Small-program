// pages/examine/examine.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityData: [],
    realTimeData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      realTimeData: JSON.parse(options.realTimeData)
    })
    console.log(JSON.parse(options.realTimeData));
    this.getSignUp();
  },

  getSignUp() {
    let that = this;
    wx.showLoading({
      title: '加载中...'
    })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: "getSignUp",
          data: {
            openid: res.data
          }
        }).then(res => {
          //获取未读信息数据渲染界面
          for (let i = 0; i < res.result.data.length; i++) {
            res.result.data[i].newNum = 0;
          }
          for (let i = 0; i < res.result.data.length; i++) {
            that.data.realTimeData.forEach(item => {
              if (item._id == res.result.data[i]._id) {
                res.result.data[i].newNum = item.newSignup.length
              }
            })
          }
          that.setData({
            activityData: res.result.data
          });
          wx.hideLoading();
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({
            title: `${err}`
          })
        })
      },
    })
  },
  //点击查看
  onChange(event) {
    let that = this;
    let activityData = that.data.activityData;
    //点击收起时
    if (event.detail.length == 0) {
      for (let i = 0; i < activityData.length; i++) {
        if (activityData[i]._id == event.currentTarget.dataset.id) {
          activityData[i].activeNames = event.detail;
        }
      }
      that.setData({
        activityData: activityData
      });
      return
    };
    //点击下拉请求数据
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: "getsignUpUserInfo",
      data: {
        useridArr: event.currentTarget.dataset.signup
      }
    }).then(res => {
      console.log(res);
      wx.hideLoading();
      res.result.data.forEach(item => {
        for (let i = 0; i < that.data.realTimeData.length; i++) {
          if (that.data.realTimeData[i]._id == event.currentTarget.dataset.id) {
            if (that.data.realTimeData[i].newSignup.some(j => j == item.openid)) {
              item.isNewSignup = true;
            } else {
              item.isNewSignup = false;
            }
          }
        }
      })
      for (let i = 0; i < activityData.length; i++) {
        if (activityData[i]._id == event.currentTarget.dataset.id) {
          activityData[i].userInfoData = res.result.data;
          activityData[i].activeNames = event.detail;
        }
      }
      that.setData({
        activityData: activityData
      });
      console.log(that.data.activityData);
    }).catch(err => {
      wx.hideLoading();
      Dialog.alert({
        title: `${err}`
      })
    })
  },
  //同意
  clickAgreeRefuse(event) {
    wx.showLoading({
      title: '加载中...'
    })
    let that = this;
    let cloudName = "agreeAttendActivity";
    let dialogTitle = '已同意！';
    let activityData = that.data.activityData;
    let current = event.currentTarget.dataset;
    if (current.type == 'refuse') {
      cloudName = "refuseAttendActivity";
      dialogTitle = "已拒绝！"
    }
    wx.cloud.callFunction({
      name: cloudName,
      data: {
        userid: current.userid,
        id: current.id
      }
    }).then(res => {
      console.log(res);
      wx.hideLoading();
      if (res.result.stats.updated == 1) {
        for (let i = 0; i < activityData.length; i++) {
          if (activityData[i]._id == current.id) {
            for (let j = 0; j < activityData[i].userInfoData.length; j++) {
              if (activityData[i].userInfoData[j].openid == current.userid) {
                activityData[i].userInfoData.splice(j, 1);
              }
            }
            for (let j = 0; j < activityData[i].signup.length; j++) {
              if (activityData[i].signup[j] == current.userid) {
                activityData[i].signup.splice(j, 1);
              }
            }
          }
        }
        that.setData({
          activityData: activityData
        })
        Dialog.alert({
          title: `${dialogTitle}`
        })
        if (dialogTitle == '已同意！'){
          that.successSubscribe(event.currentTarget.dataset);
        } else if (dialogTitle == '已拒绝！') {
          that.failSubscribe(event.currentTarget.dataset);
        }
      }
    }).catch(err => {
      wx.hideLoading();
      Dialog.alert({
        title: `${err}`
      })
    })
  },

  clickRefuse(event) {

  },
  // 报名成功订阅推送
  successSubscribe(event) {
    console.log(event);
    let parameter = {
      touser: event.userid,
      template_id: 'BTmSQ1qoRxdXBaxY-KSDFddnquKiIrCrvkUlNBXOkMM',
      page: `/pages/index/index?activityId=${event.id}`,
      data: {
        thing2: {
          value: event.description.title
        },
        thing5: {
          value: event.description.place
        },
        date4: {
          value: event.description.startTime
        },
        phrase8: {
          value: '报名成功'
        },
        name1: {
          value: event.nickname
        }
      }
    }
    wx.cloud.callFunction({
      name: 'subscribe',
      data: {
        parameter: parameter
      }
    }).then(res => {
      console.log(res, parameter);
    }).catch(err => {
      console.log(err);
    })
  },
  //报名失败订阅推送
  failSubscribe(event){
    let parameter = {
      touser: event.userid,
      template_id: '7rmRkeHCN4L0DrrTN9CybioxEoTQBjVMs3htRSYNhR8',
      data: {
        thing1: {
          value: event.description.title
        },
        name4: {
          value: event.nickName
        },
        thing5: {
          value: '您的报名申请已被拒绝！'
        }
      }
    }
    wx.cloud.callFunction({
      name: 'subscribe',
      data: {
        parameter: parameter
      }
    }).then(res => {
      console.log(res, parameter);
    }).catch(err => {
      console.log(err);
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