// component/checkbox-select/checkbox-select.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propA:{
      type:null
    },
    propB:{
      type:null
    },
    propC: {
      type: null
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    checkboxNameArr:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancelCheckboxSelect: function(){
      this.triggerEvent("onCheckboxSelect")
    },
    clickCheckboxSelect: function(){
      this.data.checkboxNameArr = [];
      for(let i=0;i<this.data.propC.length;i++){
        if (this.data.propB.some(item => item == this.data.propC[i].id)){
          this.data.checkboxNameArr.push(this.data.propC[i].name);
        }
      }
      this.triggerEvent("onCheckboxSelect",{idArr:this.data.propB,nameArr:this.data.checkboxNameArr});
    },
    onChange(event) {
      this.setData({
        propB: event.detail
      });
    },
    toggle(event) {
      const { index } = event.currentTarget.dataset;
      const checkbox = this.selectComponent(`.checkboxes-${index}`);
      checkbox.toggle();
    },
    noop() {}
  }
})
