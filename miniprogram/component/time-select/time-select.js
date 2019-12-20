// component/time-select.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propA: {
      type: null,
      observer: function (newVal, oldVal, changedPath) { }
    },
    propB: {
      type: null,
      observer: function (newVal, oldVal, changedPath) { }
    },
    propC: {
      type: null,
      observer: function (newVal, oldVal, changedPath) { }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //取消
    cancelTimeSelect: function(){
      this.setData({propB: {}});
      this.triggerEvent('onTimeSelect');
    },
    confirmTimeSelect: function (value) {
      console.log(value,new Date(value.detail));

      this.triggerEvent('onTimeSelect', value.detail);
    },
  }
})
