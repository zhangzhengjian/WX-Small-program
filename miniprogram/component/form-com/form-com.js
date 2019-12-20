// component/form-com/form-com.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
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
    goPageDetail(event){
      console.log(event);
      if(event.currentTarget.dataset.state == 0){
        wx.navigateTo({
          url: `/pages/add/add?formId=${event.currentTarget.dataset.id}`
        })
      }else{
        wx.navigateTo({
          url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}`
        })
      }
    },
    
    clickDelete(event){
      Dialog.confirm({
        title: `确定删除？`,
      }).then(() => {
        this.deleteForm(event)
      }).catch(() => {})
    },
    deleteForm(event){
      let that = this;
      wx.showLoading({ title: '加载中...' });
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          wx.cloud.callFunction({
            name: 'deleteActivity',
            data:{
              id: event.currentTarget.dataset.id,
              state: event.currentTarget.dataset.state,
              openid: res.data
            }
          }).then(res => {
            wx.hideLoading();
            if(res.result.stats.removed == 1){
              console.log('success')
              that.triggerEvent("deleteSuccess",{});
            }else{
              that.triggerEvent("deleteFail",{});
            }
          }).catch(err => {
            that.triggerEvent("deleteFail", {});
          })
        },
      })
    }
  }
})