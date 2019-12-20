// component/photo-com/photo-com.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    deleteImage(event){
      this.triggerEvent("deleteImage", event.currentTarget.dataset.path);
    }
  }
})
