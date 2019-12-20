// pages/upload-photo/upload-photo.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    upLoadData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  goPageHome() {
    wx.switchTab({
      url: `/pages/index/index`
    })
  },
  //获取图片
  openSystemFile() {
    let that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        let photoData = [];
        for(let i=0;i<res.tempFilePaths.length;i++){
          let photo = { path: '', isUpLoad: 0, progress: 0, type: 'photo' };
          photo.path = res.tempFilePaths[i]
          photoData.push(photo);
        }
        that.data.upLoadData = that.data.upLoadData.concat(photoData);
        that.setData({
          upLoadData: that.data.upLoadData
        })
      }
    })
  },
  //选择视频
  openSystemVideo() {
    let that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: ['front', 'back'],
      success: function (res) {
        let video = { path: '', isUpLoad: 0, progress: 0, type: 'video' };
        video.path = res.tempFilePath;
        that.data.upLoadData.push(video);
        that.setData({
          upLoadData: that.data.upLoadData
        })
      }
    })
  },
  //上传图片
  upLoad(){
    let that = this;
    let result = that.data.upLoadData;
    if(result.some(item => item.isUpLoad == 1)){
      Dialog.alert({ title: `正在上传中，请勿重复操作！` });
      return;
    }
    for (let i = 0; i < result.length;i++){
      if (result[i].isUpLoad == 0 || result[i].isUpLoad == 3){
        result[i].isUpLoad = 1;
        that.setData({ upLoadData: result });
        wx.cloud.uploadFile({
          cloudPath: 'userAlbum/' + Date.now() + result[i].path.match(/\.[^.]+?$/)[0],
          filePath: result[i].path,
          success: res => {
            result[i].isUpLoad = 2;
            that.setData({ upLoadData: result });
            that.addUserPhoto({path:res.fileID,type:result[i].type});
          },
          fail: err => {
            result[i].isUpLoad = 3;
            result[i].progress = 0;
            that.setData({ upLoadData: result });
          }
        }).onProgressUpdate((res) => {
          result[i].progress = res.progress;
          that.setData({ upLoadData: result });
        })
      }
    }
  },

  addUserPhoto(result){
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.cloud.callFunction({
          name:"addPhotoPath",
          data:{
            openid: res.data,
            path: result.path,
            type: result.type
          }
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
      }
    })
  },
  goPageHome() {
    wx.switchTab({
      url: `/pages/index/index`
    })
  },
  goPageAlbum(){
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        wx.navigateTo({
          url: `/pages/photo-album/photo-album?userid=${res.data}`
        })
      }
    })
  },
  //删除照片
  deleteImage(event){
    let upLoadData = this.data.upLoadData;
    for(let i = upLoadData.length-1;i>=0;i--){
      if (upLoadData[i].path == event.detail){
        upLoadData.splice(i,1);
      }
    }
    this.setData({
      upLoadData:upLoadData
    })
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