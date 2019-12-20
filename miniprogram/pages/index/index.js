//index.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
const app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    activityType: '0',
    activityId: null,
    num: 0,
    size: 5,
    activityData: [],
    value: '',
    city: '请选择',
    adcode:null,
    isLoad: true
  },

  onLoad: function(options) {
    if (options.activityId && options.activityId !== 'null'){
      this.setData({ activityId: options.activityId });
    }else{
      this.setData({ activityId: null });
    }
    let that = this;
    wx.checkSession({
      success(res) {
        console.log(res);
        that.getAddressInfo(); //获取用户地址
        that.getActivityData(); //获取数据
      },
      fail(err) {
        if (options.loginType == 'tourist') {
          that.getActivityData(); //获取数据
          wx.getStorage({
            key: 'address',
            success: function(res) {
              if(res.data.city){
                that.setData({
                  city: res.data.city,
                  adcode: res.data.adcode
                })
              }
            }
          })
        } else {
          wx.redirectTo({
            url: `../login/login?activityId=${that.data.activityId}`
          })
          return
        }
      }
    })
  },
  //获取当前用户地点
  getAddressInfo: function() {
    let that = this;
    qqmapsdk = new QQMapWX({
      key: 'MAPBZ-4EK3W-OH4R3-OUBPD-5QND5-67FFO'
    });
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            that.setData({
              city: res.result.address_component.city,
              adcode: res.result.ad_info.adcode,
            })
            //存储地理数据
            wx.setStorage({
              key: 'address',
              data: {
                adcode: res.result.ad_info.adcode,
                address: res.result.address_component.province + '/' + res.result.address_component.city + '/' + res.result.address_component.district,
                city: res.result.address_component.city
              }
            })
          },
          fail: function(res) {
            console.log(res);
          }
        });
      },
      fail(){
        wx.getStorage({
          key: 'address',
          success: function(res) {
            that.setData({
              city: res.data.city,
              adcode: res.data.adcode,
            })
          }
        })
      }
    })
  },

  onShow: function() {},

  //获取活动数据
  getActivityData() {
    wx.showLoading({
      title: '加载中...'
    })
    let that = this;
    if (that.data.activityType == '2' && that.data.city == '请选择') {
      wx.hideLoading();
      Dialog.confirm({
        title: `请先选择所在城市！`,
        confirmButtonText: '跳转'
      }).then(() => {
        wx.navigateTo({
          url: `/pages/citySelect/citySelect?areaCode=${that.data.adcode}&city=${that.data.city}`
        })
      }).catch(() => {})
      return;
    }
    wx.getStorage({
      key: 'openid',
      success: function(openid) {
        wx.cloud.callFunction({
          name: 'getActivity',
          data: {
            type: that.data.activityType,
            city: that.data.city,
            num: that.data.num,
            size: that.data.size,
            openid: openid.data
          }
        }).then(res => {
          wx.stopPullDownRefresh();
          if (res.result == null) {
            wx.hideLoading();
            that.setData({
              isLoad: false
            });
            return
          };
          if (res.result.data.length < 5) {
            that.setData({
              isLoad: false
            })
          }
          let result = res.result.data;
          for (let i = 0; i < result.length; i++) {
            result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
            result[i].description.overTime = result[i].description.overuptoTime - new Date().getTime();
          }
          that.data.activityData = that.data.activityData.concat(result);
          wx.hideLoading();
          that.setData({
            activityData: that.data.activityData
          })
          if (that.data.activityId !== null) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${that.data.activityId}`
            })
            that.setData({ activityId: null })
          }
        }).catch(err => {
          wx.hideLoading()
          if (that.data.activityId !== null) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${that.data.activityId}`
            })
            that.setData({ activityId: null })
          }
          Dialog.alert({
            title: `${err}`
          })
        })
      },
      fail: function(err){
        wx.cloud.callFunction({
          name: 'getActivity',
          data: {
            type: that.data.activityType,
            city: that.data.city,
            num: that.data.num,
            size: that.data.size,
            openid: ''
          }
        }).then(res => {
          wx.stopPullDownRefresh();
          if (res.result == null) {
            wx.hideLoading();
            that.setData({
              isLoad: false
            });
            return
          };
          if (res.result.data.length < 5) {
            that.setData({
              isLoad: false
            })
          }
          let result = res.result.data;
          for (let i = 0; i < result.length; i++) {
            result[i].description.activityTypeArr = result[i].description.activityTypeName.split(',');
            result[i].description.overTime = result[i].description.overuptoTime - new Date().getTime();
          }
          that.data.activityData = that.data.activityData.concat(result);
          wx.hideLoading();
          that.setData({
            activityData: that.data.activityData
          })
          try {
            wx.setStorageSync('openid', '')
          } catch (e) { };
          if (that.data.activityId !== null) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${that.data.activityId}`
            })
            that.setData({ activityId: null })
          }
        }).catch(err => {
          wx.hideLoading()
          if (that.data.activityId !== null) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${that.data.activityId}`
            })
            that.setData({ activityId: null })
          }
          Dialog.alert({
            title: `${err}`
          })
        })
      }
    })
  },
  // //获取openid
  // getStorage() {
  //   let that = this;
  //   wx.getStorage({
  //     key: 'openid',
  //     success: function(openid) {
  //       that.getActivityData(openid)
  //     },
  //     fail: function() {
  //       that.getActivityData({
  //         data: ''
  //       })
  //     }
  //   })
  // },

  onChangeTabs(event) {
    console.log(new Date('2019-11-30 19:00:00').getTime(), new Date('2019-11-30 23:00:00').getTime(), new Date('2019-11-29 19:00:00').getTime())
    this.setData({
      activityType: String(event.detail.index),
      activityData: [],
      num: 0,
      isLoad: true
    })
    //获取活动数据
    this.getActivityData();

  },
  //搜索
  goPageSearch() {
    wx.navigateTo({
      url: `/pages/search/search`
    })
  },
  //跳转地址页面
  goAddressPage: function(e) {
    wx.navigateTo({
      url: `/pages/citySelect/citySelect?areaCode=${this.data.adcode}&city=${this.data.city}`
    })
  },
  //地址选择页面传递来的数据
  addressEvent: function(city, adcode) {
    this.setData({
      city: city,
      adcode: adcode
    })
    if (this.data.activityType == '2') {
      this.getActivityData();
    }
    wx.setStorage({
      key: 'address',
      data: {
        city: city,
        adcode: adcode
      }
    })
  },

  bindgetuserinfo: function(e) {
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.isLoad) {
      return
    };
    this.data.num++
      this.setData({
        num: this.data.num
      });
    this.getActivityData();
  },
  //下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      num: 0,
      activityData: [],
      isLoad: true
    })
    this.getActivityData();
  },
})