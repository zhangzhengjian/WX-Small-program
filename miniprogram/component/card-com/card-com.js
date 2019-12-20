// miniprogram/component/card-com/card-com.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');
Component({
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
    isClick: true
  },
  lifetimes: {
    ready: function () {
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },


  /**
   * 组件的方法列表
   */
  methods: {
    onTimeChange(e){
      for(let i=0;i<this.data.propA.length;i++){
        if (this.data.propA[i]._id == e.currentTarget.dataset.id){
          this.data.propA[i].description.timeData = e.detail;
        }
      }
      this.setData({ propA: this.data.propA });
    },
    goDetailPage: function(event){
      wx.navigateTo({
        url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}`
      })
    },
    goPageSpace: function(event){
      wx.navigateTo({
        url: `/pages/personal-space/personal-space?openid=${event.currentTarget.dataset.openid}`
      })
    },
    //收藏or取消收藏
    clickCollect(event){
      //2秒内避免重复点击
      let that = this;
      if (that.data.isClick) {
        that.data.isClick = false
        setTimeout(function () { that.setData({ isClick: true }) }, 2000);
      } else {
        return;
      }
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          console.log(res);
          if(res.data == ''){
            Dialog.confirm({
              title: `请先完成登录！`,
              confirmButtonText: '跳转'
            }).then(() => {
              wx.navigateTo({
                url: `/pages/login/login`
              })
            }).catch(() => {
              Dialog.close();
            });
          }else{
            that.collect(event);
          }
        }
      })
    },

    collect(event){
      let that = this;
      let functionName;
      event.currentTarget.dataset.type == 'cancel'
      ? (functionName = 'cancelCollectActivity')
      : (functionName = 'collectActivity')
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          wx.cloud.callFunction({
            name: functionName,
            data: {
              id: event.currentTarget.dataset.id,
              openid: res.data
            }
          }).then(res => {
            console.log(res);
            that.data.propA.forEach( item => {
              item._id == event.currentTarget.dataset.id
              ? (item.description.collect = !item.description.collect)
              : (null)
            })
            that.setData({
              propA:that.data.propA
            })
          }).catch(err => {
            console.log(err)
          })
        },
      })
    },
    anotherEventListener: function (e) {
      console.log('anotherEventListener [from custom component]')
    },
    //图片预览
    clickImage: function (e) {
      let imagesUrl = [];
      for (let i = 0; i < this.data.propA.length; i++) {
        if (this.data.propA[i].id == e.currentTarget.dataset.parentid) {
          for (let j = 0; j < this.data.propA[i].imagesUrl.length; j++) {
            imagesUrl.push(this.data.propA[i].imagesUrl[j].url);
          }
        }
      }
      wx.previewImage({
        current: e.currentTarget.dataset.url,//当前预览图片
        urls: imagesUrl // 需要预览的图片http链接列表
      })
    }
  }
})