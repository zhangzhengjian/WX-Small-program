import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
//实时推送
const db = wx.cloud.database()
let num = {activityNum:0,noticeNum:0};
let realTimeData = [];
let noticeData = {
  newAgreeActivityId:[],
  newRefuseActivityId:[]
};
let that = null;
//获取报名数据
function getSignupData(res){
  db.collection("activity").where({
    'description.openid': res.data
  }).field({ newSignup: true }).get().then(resOne => {
    console.log(resOne);
    let activityNum = 0;
    for (let i = resOne.data.length - 1; i >= 0; i--) {
      if (resOne.data[i].newSignup.length == 0) {
        resOne.data.splice(i, 1);
      } else {
        activityNum = resOne.data[i].newSignup.length + activityNum
      }
    }
    realTimeData = resOne.data;
    num.activityNum = activityNum;
    if (num.activityNum > 0 || num.notice > 0) {
      wx.showTabBarRedDot({ index: 2 })
    }
    if (that !== null) {
      that.setData({
        num: num,
        realTimeData: JSON.stringify(realTimeData)
      })
    }
  })
}

//获取通知数据
function getNoticeData(res) {
  db.collection("userActivity").where({
    openid: res.data
  }).field({
    newAgreeActivityId: true, 
    newRefuseActivityId: true
  }).get().then(resOne => {
    console.log(resOne);
    let result = resOne.data[0];
    num.noticeNum = result.newAgreeActivityId.length + result.newRefuseActivityId.length;
    if (num.activityNum > 0 || num.noticeNum > 0){
      wx.showTabBarRedDot({ index: 2 })
    }
    noticeData = result;
    if (that !== null) {
      that.setData({
        num: num,
        noticeData: JSON.stringify(noticeData)
      })
    }
  })
}

wx.getStorage({
  key: 'openid',
  success: function(res) {
    const watcher = db.collection('activity').where({
      'description.openid': res.data
    }).watch({
      onChange: function (snapshot) {
        console.log(snapshot);
        //新用户没有发布过活动时snapshot.docChanges为空数组，判断结束
        if (snapshot.docChanges.length == 0) { return };
        //用户报名时updatedFields对象中会出现signup.0的属性名，只关注该属性名的变更状态
        let result = snapshot.docChanges[0];
        //初始化获取报名数据
        if (result.dataType == 'init'){
          getSignupData(res);
        }
        if (result.updatedFields !== undefined) {
          let key = Object.keys(result.updatedFields)[0].split('.');
          if (key[0] == 'newSignup' || key[0] == 'signup') {
            getSignupData(res);
          }
        }
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
})

wx.getStorage({
  key: 'openid',
  success: function(res) {
    const notice = db.collection('userActivity').where({
      openid: res.data
    }).watch({
      onChange: function (snapshot) {
        console.log(snapshot);
        //新用户没有发布过活动时snapshot.docChanges为空数组，判断结束
        if (snapshot.docChanges.length == 0) { return };
        //报名成功或失败.0的属性名，只关注该属性名的变更状态
        let result = snapshot.docChanges[0];
        if (result.dataType == 'init') {
          getNoticeData(res);
        }
        if (result.updatedFields !== undefined) {
          let key = Object.keys(result.updatedFields)[0].split('.');
          if (key[0] == 'newRefuseActivityId' || key[0] == 'newAgreeActivityId' ||
          key[0] == 'refuseActivityId' || key[0] == 'agreeActivityId') {
            getNoticeData(res);
          }
        }
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    realTimeData: JSON.stringify([]),
    noticeData: JSON.stringify({newAgreeActivityId: [], newRefuseActivityId: []}),
    num:{ activityNum:0 }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    that = this;
    that.setData({
      num: num,
      realTimeData: JSON.stringify(realTimeData),
      noticeData: JSON.stringify(noticeData)
    })
    if(num.activityNum == 0 && num.noticeNum == 0){
      wx.hideTabBarRedDot({ index: 2 })
    }
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