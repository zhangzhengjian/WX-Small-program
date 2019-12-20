// component/follow-com/follow-com.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propA: {
      type: null,
      observer: function (newVal, oldVal, changedPath) { }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isClick:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goPageSpace(event) {
      wx.navigateTo({
        url: `/pages/personal-space/personal-space?openid=${event.currentTarget.dataset.userid}`
      })
    },

    clickFollow(event) {
      //2秒内避免重复点击
      let that = this;
      if (that.data.isClick) {
        that.data.isClick = false
        setTimeout(function () { that.setData({ isClick: true }) }, 2000);
      } else {
        return;
      }
      wx.showLoading({ title: '加载中...' });
      util.getUserInfo().then(function (res) {
        if (res.result.data[0].perject) {
          that.follow(event.currentTarget.dataset.userid);
        } else {
          Dialog.confirm({
            title: `请先完善个人信息！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({
              url: `/pages/userInfo/userInfo`
            })
          }).catch(() => {
            Dialog.close();
          });
        }
        wx.hideLoading();
      }, function (err) {
        wx.hideLoading();
        Dialog.alert({ title: `获取用户信息失败！` })
      });
    },
    follow(userid) {
      let that = this;
      wx.getStorage({
        key: 'openid',
        success: function (res) {
          wx.cloud.callFunction({
            name: 'follow',
            data: {
              openid: res.data,
              userid: userid
            }
          }).then(res => {
            wx.hideLoading();
            if (res.result.errMsg.split(':')[1] == 'ok') {
              for (let i = 0; i < that.data.propA.length; i++) {
                if (that.data.propA[i].openid == userid) {
                  that.data.propA[i].isFollow = !that.data.propA[i].isFollow;
                }
              }
              that.setData({
                propA: that.data.propA
              })
            }
          }).catch(err => {
            wx.hideLoading();
            Dialog.alert({ title: `请求失败！` })
          })
        },
      })
    },
  }
})
