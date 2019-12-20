// component/sex-select/sex-select.js
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
    cancelRadioSelect: function () {
      this.triggerEvent('onRadioSelect');
    },
    clickRadioSelect: function(e){
      this.triggerEvent('onRadioSelect', { id: this.data.propB.current,type:this.data.propB.type});
    },
    changeRadioSelect: function(e){
      this.data.propB.current = e.detail;
      this.setData({
         propB: this.data.propB
      })
    },
    onClick(event) {
      this.data.propB.current = event.currentTarget.dataset.id
      this.setData({
        propB: this.data.propB
      });
    }
  }
})
