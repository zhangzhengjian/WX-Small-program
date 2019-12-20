// component/age-select/age-select.js
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
    currentAge:{maxAge:'无限制',maxIndex:1,minAge:'无限制',minIndex:1},
    columnOne: [],
    columnTwo: []
  },
  lifetimes: {
    attached: function () {
      for(let i=18;i<=60;i++){
        this.data.columnOne.push({ text: String(i) });
        this.data.columnTwo.push({ text: String(i) });
      }
      //组件BUG,索引为0时不能正常定位，所以初始化在数据第一位增加空值
      this.data.columnOne.unshift({ text: '', disabled: true}, { text: '无限制'})
      this.data.columnTwo.unshift({ text: '', disabled: true}, { text: '无限制'})
      this.setData({
        columnOne:this.data.columnOne,
        columnTwo:this.data.columnTwo
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //初始化数据
    formatData: function(){
    },
    //取消
    cancelAgeSelect: function () {
      //深拷贝当前选项，使选中项与传出数据一致
      for (var item in this.data.propB) {
        this.data.currentAge[item] = this.data.propB[item];
      }
      //更新数据禁用项，防止再次进入数据显示与选中项不匹配
      for (let i = 0; i < this.data.columnTwo.length; i++) {
        if (i < this.data.propB.minIndex) {
          this.data.columnTwo[i].disabled = true;
        } else {
          this.data.columnTwo[i].disabled = false;
        }
      }
      this.setData({
        propB: {},
        columnTwo: this.data.columnTwo
      })
      this.triggerEvent('onAgeSelect');
    },
    //确定
    clickAgeSelect: function(e){
      //将选中数据深拷贝入传出数据
      for (var item in this.data.currentAge) {
        this.data.propB[item] = this.data.currentAge[item];
      }
      this.triggerEvent('onAgeSelect', this.data.propB);
    },

    onChangeOne: function(e){
      this.data.currentAge.minAge = e.detail.value.text;
      this.data.currentAge.minIndex = e.detail.index;
      this.data.currentAge.maxAge = this.data.currentAge.minAge;
      this.data.currentAge.maxIndex = this.data.currentAge.minIndex;
      for (let i = 0; i < this.data.columnTwo.length; i++) {
        if (i < e.detail.index) {
          this.data.columnTwo[i].disabled = true;
        } else {
          this.data.columnTwo[i].disabled = false;
        }
      }
      this.setData({
        columnTwo: this.data.columnTwo
      })
    },

    onChangeTwo: function (e) {
      this.data.currentAge.maxAge = e.detail.value.text;
      this.data.currentAge.maxIndex = e.detail.index;
    }
  }
})
