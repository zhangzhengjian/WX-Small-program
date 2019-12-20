// pages/personal-space/personal-space.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex: '1',
    userInfoData: {},
    photoData: [],
    scrollWidth: 0,
    userid: '',
    buttonText: '关注',
    isButton: true,
    isPraise: true,
    isPrivate: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userid: options.openid
    });
    this.getUserInfo(options.openid);
  },
  getUserInfo(userid) {
    let that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if (res.data == that.data.userid) {
          that.setData({
            isButton: false
          })
        } else {
          that.setData({
            isButton: true
          })
        }
        wx.cloud.callFunction({
          name: 'getUserInfo',
          data: {
            openid: res.data,
            userid: userid
          }
        }).then(res => {
          wx.hideLoading();
          if (res.result.errMsg.split(':')[1] == 'ok') {
            that.setData({
              userInfoData: res.result.data[0]
            })
            that.getPhoto(userid);
          } else {
            Dialog.alert({
              title: `${res.result.errMsg}`
            })
          }
          console.log(res);
        }).catch(err => {
          Dialog.alert({
            title: `${res.result.errMsg}`
          })
        })
      },
    })
  },
  getPhoto(userid) {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(openid) {
        wx.cloud.callFunction({
          name: "getUserPhoto",
          data: {
            userid: userid,
            openid: openid.data
          }
        }).then(res => {
          console.log(res);
          if (res.result.data.length == 0) {
            return
          };
          if (res.result.data[0].type == '1' && userid !== openid.data) {
            that.setData({
              isPrivate: true
            })
          }
          let scrollWidth = 0;
          let result = res.result.data[0].photoAlbum.slice(0, 4);
          for (let i = 0; i < result.length; i++) {
            result[i].type == 'photo' ?
              (scrollWidth = scrollWidth + 216 + 10) :
              (scrollWidth = scrollWidth + 280 + 10)
          }
          that.setData({
            photoData: result,
            scrollWidth: scrollWidth
          })
        })
      }
    })
  },
  signup() {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if (res.data == '') {
          wx.hideLoading();
          Dialog.confirm({
            title: `请先完成登录！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({
              url: `/pages/login/login`
            })
            return;
          }).catch(() => {
            Dialog.close();
          });
        } else {
          that.follow();
        }
      }
    })

  },

  follow() {
    let that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: 'follow',
          data: {
            openid: res.data,
            userid: that.data.userid
          }
        }).then(res => {
          wx.hideLoading();
          if (res.result.errMsg.split(':')[1] == 'ok') {
            that.data.userInfoData.isFollow = !that.data.userInfoData.isFollow;
            that.setData({
              userInfoData: that.data.userInfoData
            })
          }
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({
            title: `请求失败！`
          })
        })
      },
    })
  },
  //返回首页
  backHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  clickPraise() {
    let that = this;
    if (!that.data.isPraise) {
      return
    };
    wx.cloud.callFunction({
      name: "praise",
      data: {
        userid: that.data.userid
      }
    }).then(res => {
      that.data.userInfoData.praise = that.data.userInfoData.praise + 1
      that.setData({
        userInfoData: that.data.userInfoData,
        isPraise: false
      })
    })
  },
  //上传照片
  goPageUpdate() {
    wx.navigateTo({
      url: `/pages/upload-photo/upload-photo`
    })
  },
  //相册
  goPageAlbum() {
    let that = this;
    wx.navigateTo({
      url: `/pages/photo-album/photo-album?userid=${that.data.userid}`
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