// pages/detail/detail.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityDetail: {},
    timeData:{},
    activityId:null,
    activeNames: '',
    footerIndex: '', //1:活动结束，2:普通用户进入，//3:发起人进入
    isShow: false, //是否显示footer
    isFooter: true, //是否为发起人
    isAdopt: false, //当前用户是否报名成功
    isCancel: false, //禁用按钮
    isAutoplay: true,
    isClick:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      activityId: options.id
    });
    this.getActivityData(options.id);
  },
  //获取活动详情
  getActivityData: function(id) {
    console.log(new Date('2019-12-23 15:08:00').getTime());
    wx.showLoading({
      title: '加载中...'
    })
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: 'getActivityDetail',
          data: {
            id: id,
            openid: res.data
          }
        }).then(res => {
          console.log(res);
          wx.hideLoading();
          if (res.result.data.length > 0) {
            let result = res.result.data[0];
            let footerIndex = '';
            result.description.activityLable = result.description.activityTypeName.split(',');
            result.description.overTime = result.description.overuptoTime - new Date().getTime();
            if (result.isCancel == true) {
              footerIndex = '1';
            }else{
              if (result.description.isFooter) {
                footerIndex = '2';
              } else {
                footerIndex = '3';
              }
            }
            that.setData({
              activityDetail: result,
              isCancel: result.isCancel,
              footerIndex: footerIndex
            })
          } else {
            Dialog.alert({
              title: `请求失败，该活动可能已被删除！`
            }).then(()=>{
              wx.navigateBack({ delta: 1 });
            })
          }
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({
            title: `请求失败，该活动可能已被删除！`
          }).then(() => {
            wx.navigateBack({ delta: 1 });
          })
        })
      },
    })
  },

  onTimeChange(e) {
    this.setData({ timeData: e.detail });
  },
  //播放视频文件
  bindplay() {
    this.setData({
      isAutoplay: false
    })
  },
  bindpause() {
    this.setData({
      isAutoplay: true
    })
  },
  //图片预览
  previewImage(event) {
    //2秒内避免重复点击
    let that = this;
    if (that.data.isClick) {
      that.data.isClick = false
      setTimeout(function () { that.setData({ isClick: true }) }, 2000);
    } else {
      return;
    }
    let imagesArr = [];
    let result = that.data.activityDetail.description;
    for (let i = 0; i < result.images.length; i++) {
      if (result.images[i].type == 'photo') {
        imagesArr.push(result.images[i].path);
      }
    }
    wx.previewImage({
      current: event.currentTarget.dataset.path,
      urls: imagesArr
    })
  },
  //展开面板
  onChange: function(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  //进入个人空间
  goPageSpace: function(event) {
    wx.navigateTo({
      url: `/pages/personal-space/personal-space?openid=${event.currentTarget.dataset.openid}`
    })
  },
  //联系创建人
  contact: function(event) {
    Dialog.alert({
      title: '暂未开通',
      message: '可进入空间获取联系方式！'
    })
  },
  //取消
  cancel: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  //报名
  signUp: function(event) {
    let that = this;
    if (that.data.activityDetail.description.isSignUp) {
      Dialog.alert({
        title: `您已报名，请关注通知！`
      })
      return;
    }
    wx.showLoading({
      title: '加载中...'
    });
    new Promise((resolve,reject) => {
      wx.getStorage({
        key: 'openid',
        success: function (res) {
          if (res.data == '') {
            wx.hideLoading();
            Dialog.confirm({
              title: `请先完成登录！！`,
              confirmButtonText: '跳转'
            }).then(() => {
              wx.navigateTo({
                url: `/pages/login/login?activityId=${that.data.activityId}`
              })
              return;
              }).catch(() => {
                Dialog.close();
              });
          }else{
            resolve(res);
          }
        }
      })
    }).then(function(res){
      util.getUserInfo().then(function (res) {
        if (res.result && res.result.data[0].perject) {
          that.addSignUp(event.currentTarget.dataset.id);
        } else {
          wx.hideLoading();
          Dialog.confirm({
            title: `请先完善个人信息！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({
              url: `/pages/userInfo/userInfo`
            })
          }).catch(() => {
            wx.hideLoading();
            Dialog.close();
          });
        }
      }, function (err) {
        Dialog.alert({
          title: `获取用户信息失败！`
        })
      });
    })
  },
  //报名保存
  addSignUp(id) {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name: 'signUp',
          data: {
            id: id,
            openid: res.data
          }
        }).then(res => {
          wx.hideLoading();
          if (res.result.title == '报名成功！') {
            that.data.activityDetail.description.isSignUp = !that.data.activityDetail.description.isSignUp;
            that.setData({
              activityDetail: that.data.activityDetail
            })
            that.signupSubscribe();
            wx.navigateTo({
              url: `/pages/subscribe/subscribe?type=signup`
            })
          } else {
            Dialog.alert({ title: res.result.title });
          }
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({
            title: `报名失败！`
          })
        })
      },
    })
  },
  //取消活动
  cancelActivity(event) {
    let that = this;
    Dialog.confirm({
      title: `确定取消该活动？`
    }).then(() => {
      wx.showLoading({ title: '加载中...' });
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          wx.cloud.callFunction({
            name: 'cancelActivity',
            data: {
              id: event.currentTarget.dataset.id,
              openid: res.data
            }
          }).then(res => {
            wx.hideLoading();
            if (res.result.stats.updated == 1) {
              that.setData({
                footerIndex: '1',
                isCancel: true
              })
            }
          }).catch(err => {
            wx.hideLoading();
            Dialog.alert({
              title: `操作失败！`
            })
          })
        }
      })
    })
  },

  //报名推送给发起人
  signupSubscribe(){
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        let parameter = {
          touser: that.data.activityDetail.description.openid,
          template_id: 'ZfGnadQelwCl4VcXkAYBvb5JiQtXXX7abV7JyQ5PIFs',
          page: `/pages/information/information`,
          data: {
            thing1: {
              value: that.data.activityDetail.description.title
            },
            date2: {
              value: that.data.activityDetail.description.startTime
            },
            name3: {
              value: res.data.nickName
            },
            thing5: {
              value: '已有用户报名，请前往小程序审批！'
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
      }
    })
  },

  //调用地图
  goPageMap: function(event) {
    let that = this;
    //2秒内避免重复点击
    if(that.data.isClick){
      that.data.isClick = false
      setTimeout(function () { that.setData({ isClick:true }) }, 2000);
    }else{
      return;
    }
    qqmapsdk = new QQMapWX({
      key: 'MAPBZ-4EK3W-OH4R3-OUBPD-5QND5-67FFO'
    });
    qqmapsdk.geocoder({
      address: `${event.currentTarget.dataset.address}${event.currentTarget.dataset.place}`,
      success: res => {
        let latitude = res.result.location.lat;
        let longitude = res.result.location.lng;
        let name = res.result.title;
        let detailAddress = `${res.result.address_components.province}${res.result.address_components.city}${res.result.address_components.district}${res.result.title}`;
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          name: name,
          address: detailAddress,
          scale: 28
        })
      },
      fail: err => {
        console.log(err);
        Dialog.alert({
          title: `${err.message}`
        })
      }
    })
  },

  //跳转到成员列表
  goPageMember(event) {
    wx.navigateTo({
      url: `/pages/activity-member/activity-member?id=${event.currentTarget.dataset.id}`
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
    let that = this;
    return {
      title: '我给你分享了一个活动',
      imageUrl: '../../images/share-image.png',
      path: `/pages/index/index?activityId=${that.data.activityId}`
    }
  }
})