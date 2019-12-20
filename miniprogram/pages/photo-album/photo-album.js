// pages/photo-album/photo-album.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagesData:[],
    isVideoMask:false,
    isPopup:false,
    isSelect:false,//是否批量选择
    isUser:false,//是否为当前用户
    progress:'',//下载进度
    videoPath:'',//视频链接
    userid:'',//进入页面的用户id
    radioData: {
      current: "0",
      data: [{ name: "公开", id: "0", }, { name: "私密", id: "1", }]
    },
    radioSelectShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      userid:options.userid
    })
    that.getUserPhoto(options.userid);
  },

  getUserPhoto(userid){
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if (res.data == userid) {
          that.setData({ isUser: true })
        }
        wx.showLoading({ title: '加载中...' })
        wx.cloud.callFunction({
          name: "getUserPhoto",
          data: {
            userid: userid,
            openid: res.data
          }
        }).then(res => {
          let date = [];
          let imagesData = [];
          let result = res.result.data[0].photoAlbum;
          for (let i = 0; i < result.length; i++) {
            result[i].isSign = false;
            if (!date.some(item => item == result[i].upLoadTime)) {
              date.push(result[i].upLoadTime);
            }
          }
          for (let i = 0; i < date.length; i++) {
            let image = {
              upLoadTime: date[i],
              year: date[i].split('-')[0],
              month: date[i].split('-')[1],
              date: date[i].split('-')[2],
              path: []
            };
            for (let j = 0; j < result.length; j++) {
              if (date[i] == result[j].upLoadTime) {
                image.path.push(result[j])
              }
            }
            imagesData.push(image);
          }
          that.data.radioData.current = res.result.data[0].type;
          that.setData({
            imagesData: imagesData,
            radioData: that.data.radioData
          })
          wx.hideLoading();
        }).catch(err => {
          wx.hideLoading();
          Dialog.alert({ title: err });
        })
      }
    })
  },

  goPageUpdate(){
    wx.navigateTo({
      url: `/pages/up-album/photo-album?userid=${res.data}`
    })
  },
  //图片预览
  previewImage(event){
    //长按批量选择状态下部触发单击事件
    if(this.data.isSelect){return};
    let imagesArr = [];
    let result = event.currentTarget.dataset;
    for(let i=0;i<result.patharr.length;i++){
      imagesArr.push(result.patharr[i].path);
    }
    wx.previewImage({
      current: result.path,
      urls: imagesArr
    })
  },
  //视频预览
  fullScreen(event){
    //长按批量选择状态下部触发单击事件
    if (this.data.isSelect) { return };
    this.setData({
      isVideoMask:true,
      videoPath:event.currentTarget.dataset.path
    })
  },
  //点击保存，判断是否授权
  preserve(){
    let that = this;
    wx.getSetting({
      success(res) {
        //未授权 先授权 然后保存
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(re) {
              that.saveToBlum();
            }
          })
        } else {
          //已授 直接调用保存到相册方法
          that.saveToBlum();
        }
      }
    })
  },
  //保存视频
  saveToBlum(event){
    let that = this;
    //获取视频临时网络地址
    wx.cloud.getTempFileURL({
      fileList: [that.data.videoPath],
      success: res => {
        //下载视频返回临时地址
        wx.downloadFile({
          url: res.fileList[0].tempFileURL,
          success(res) {
            if (res.statusCode === 200) {
              //保存临时视频到本地相册
              wx.saveVideoToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {}
              })
            }
          }
        }).onProgressUpdate((res) => {
          that.setData({
            progress: String(res.progress) + '%',
            isPopup: false
          });
        })
      }
    })
  },
  //设置
  selectShow(){
    this.setData({ radioSelectShow: true })
  },
  //单选组件传递的数据
  onRadioSelect: function (e) {
    console.log(e);
    let that = this;
    if (e.detail !== undefined && e.detail.id !== that.data.radioData.current) {
      wx.showLoading({ title: '加载中...' })
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          wx.cloud.callFunction({
            name: "updateUserPhotoType",
            data: {
              openid: res.data,
              type:e.detail.id
            }
          }).then(res => {
            wx.hideLoading();
            if(res.result.stats.updated == 1){
              that.data.radioData.current = e.detail.id;
              that.setData({ radioData: that.data.radioData });
              e.detail.id == 0
              ?(Dialog.alert({ title: '相册已设为公开' }))
              :(Dialog.alert({ title: '相册已设为私密' }))
            }
          }).catch(err => {
            wx.hideLoading();
            Dialog.alert({ title: '设置失败，请重试' });
          })
        }
      })
    }
    that.setData({ radioSelectShow: false })
  },
  //上传照片
  goPageUpdate(){
    wx.navigateTo({
      url: `/pages/upload-photo/upload-photo`
    })
  },
  goPageHome(){
    wx.switchTab({
      url: `/pages/index/index`
    })
  },
  //批量选择
  batchDelete(){
    this.setData({ isSelect: true });
  },

  //长按批量选择
  selectImages(event){
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if(res.data !== that.data.userid){ return };
        that.setData({ isSelect: true });
        that.clickSelect(event);
      }
    })
  },

  clickSelect(event){
    this.data.imagesData.forEach(item => {
      for (let i = 0; i < item.path.length; i++) {
        if (event.currentTarget.dataset.path == item.path[i].path) {
          item.path[i].isSign = !item.path[i].isSign
        }
      }
    })
    this.setData({
      imagesData: this.data.imagesData
    })
  },
  //取消选择
  cancel(){
    this.data.imagesData.forEach(item => {
      for (let i = 0; i < item.path.length; i++) {
        item.path[i].isSign = false
      }
    })
    this.setData({
      isSelect: false,
      imagesData: this.data.imagesData
    })
  },
  //删除
  delete(){
    let that = this;
    let deleteFileArr = [];
    wx.showLoading({ title: '加载中...' })
    that.data.imagesData.forEach(item => {
      for (let i = 0; i < item.path.length; i++) {
        if (item.path[i].isSign){
          deleteFileArr.push(item.path[i].path)
        }
      }
    })
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:"deleteFile",
          data:{
            openid: res.data,
            deleteFileArr: deleteFileArr
          }
        }).then(res => {
          let deleteSuccess = [];
          for(let i=0;i<res.result.fileList.length;i++){
            if (res.result.fileList[i].status == 0){
              deleteSuccess.push(res.result.fileList[i].fileID);
            }
          }
          that.data.imagesData.forEach( item => {
            for (let i = item.path.length-1; i >=0; i--) {
              if (deleteSuccess.some(j => j == item.path[i].path)) {
                item.path.splice(i,1);
              }
            }
          })
          that.setData({
            isSelect: false,
            imagesData: that.data.imagesData
          })
          wx.hideLoading();
        }).catch(err => {
          wx.hideLoading();
          console.log(err);
          Dialog.alert({ title: `${err}` });
        })
      }
    })
  },
  //点击视频阻止冒泡
  bubbling(){
    console.log('阻止冒泡')
  },
  //点击遮罩取消视频播放
  clickMask(){
    this.setData({ isVideoMask:false,videoPath:'' })
  },
  //长按视频弹出层
  showPopup() {
    this.setData({ isPopup: true });
  },
  //取消弹出层
  onClose() {
    this.setData({ isPopup: false });
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