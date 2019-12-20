// pages/userInfo/userInfo.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoData: {},
    isTextareaShow:true,
    radioSelectShow:false,//单选器是否显示
    timeSelectShow:false,//时间选择器是否显示
    timeShowType: 'date',//时间选择器展示类型-日期
    lableString:'',//标签字符串
    sexData: {
      current: "",
      type: "sex",
      data: [{ name: "男", id: "1", }, { name: "女", id: "2", }]
    },
    timeSelectDate: {
      minDate: new Date(new Date().getFullYear() - 36, 0, 1).getTime(),
      maxDate: new Date().getTime(),
      currentDate: new Date(new Date().getFullYear() - 18, 0, 1).getTime()
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if(res.data == ''){
          Dialog.confirm({
            title: `请先完成登录！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({ url: `/pages/login/login` })
          }).catch(() => {
            wx.navigateBack({ delta: 1 });
          });
          return;
        }
        wx.cloud.callFunction({
          name:'getUserInfo',
          data:{
            openid: res.data,
            userid: res.data
          }
        }).then(res => {
          console.log(res);
          if(!res.result){ return }
          let result = res.result.data[0].perject;
          that.data.sexData.current = result.sex;
          that.data.timeSelectDate.currentDate = new Date(result.birth).getTime();
          that.setData({
            userInfoData: result,
            lableString: result.lable.join(','),
            timeSelectDate: that.data.timeSelectDate
          })
        })
      },
    })
  },

  //开打单选选择器
  selectRadio: function (e) {
    e.currentTarget.dataset.type == 'sex'
      ? (this.setData({ radioData: this.data.sexData }))
      : e.currentTarget.dataset.type == 'age'
        ? (this.setData({ radioData: this.data.costData }))
        : (null);
    this.setData({radioSelectShow: true});
  },
  //单选组件传递的数据
  onRadioSelect: function (e) {
    if (e.detail !== undefined) {
      e.detail.type == 'sex'
      ? (this.data.userInfoData.sex = e.detail.id,this.data.sexData.current = e.detail.id)
      : (null);
      this.setData({
        userInfoData: this.data.userInfoData,
        sexData: this.data.sexData,
      });
    }
    this.setData({radioSelectShow: false});
    console.log(this.data.userInfoData);
  },

  //打开时间选择器
  selectTime: function (e) {
    this.setData({
      timeSelectShow: true,
      timeSelectDate: this.data.timeSelectDate
    })
  },
  //时间组件传递的数据
  onTimeSelect: function (e) {
    if (e.detail !== undefined) {
      this.data.timeSelectDate.currentDate = e.detail;
      this.data.userInfoData.birth = this.formatDateTime(new Date(e.detail));
      this.data.userInfoData.age = new Date().getFullYear() - Number(this.data.userInfoData.birth.split('-')[0]);
      this.setData({
        timeSelectDate: this.data.timeSelectDate,
        userInfoData: this.data.userInfoData
      })
    };
    this.setData({ timeSelectShow: false });
    console.log(this.data.userInfoData);
  },
  //格式化时间
  formatDateTime: function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    return y + '-' + m + '-' + d;
  },

  getPhoneNumber: function(e) {
    console.log(e);
    Dialog.alert({ title: e });
  },

  goPagelable(){
    wx.navigateTo({
      url: `/pages/lable/lable?lable=${this.data.userInfoData.lable}`
    })
  },
  getLable(event){
    this.data.userInfoData.lable = event;
    this.data.lableString = event.join(',');
    this.setData({
      userInfoData: this.data.userInfoData,
      lableString:this.data.lableString
    })
  },

  //跳转编辑页面
  goPageEdit(event) {
    wx.navigateTo({
      url: `/pages/edit/edit?type=${event.currentTarget.dataset.type}&value=${event.currentTarget.dataset.value}`
    })
  },
  //下页面返回来的数据
  getEdit(value, type) {
    console.log(value, type);
    type == "mood"
    ? (this.data.userInfoData.state = value,
      this.setData({ userInfoData: this.data.userInfoData }))
    : (null);
  },

  bindinput(event){
    //输入框输入
    event.currentTarget.dataset.type == "weixin"
    ? (this.data.userInfoData.weixin = event.detail)
    : event.currentTarget.dataset.type == "phone"
    ? (this.data.userInfoData.phone = event.detail)
    : (null)
    this.setData({
      userInfoData: this.data.userInfoData
    })
  },

  signup(){
    //必填字段非空效验
    if (this.verification()) {
      Dialog.alert({ title: `${this.verification()}` })
      return;
    }
    //未填写字段默认设key:''
    !this.data.userInfoData.phone
    ? this.data.userInfoData.phone = ''
    : !this.data.userInfoData.lable
    ? this.data.userInfoData.lable = []
    : !this.data.userInfoData.state
    ? this.data.userInfoData.state = ''
    : null

    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.showLoading({ title: '加载中...' })
        wx.cloud.callFunction({
          name: 'perfectUserInfo',
          data: {
            openid:res.data,
            userInfo:that.data.userInfoData
          }
        }).then(res => {
          wx.hideLoading();
          if (res.result.errMsg.split(':')[1] == 'ok'){
            Dialog.alert({ title: `保存成功！` }).then(() => {
              wx.navigateBack({ delta: 1 })
            })
          }
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: `保存失败！` });
        })
      }
    })
  },

  //非空验证
  verification: function () {
    return (
      !this.data.userInfoData.sex
      ? '性别不能为空'
      : !this.data.userInfoData.birth
      ? '生日不能为空'
      : !this.data.userInfoData.weixin
      ? '微信号不能为空'
      : null
    )
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.setData({//初始化时间数据
    //   timeSelectDate: {
    //     minDate: new Date(new Date().getFullYear() - 36, 0, 1).getTime(),
    //     maxDate: new Date().getTime(),
    //     currentDate: new Date(new Date().getFullYear() - 18, 0, 1).getTime()
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})