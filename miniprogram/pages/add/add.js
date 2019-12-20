// pages/add/add.js
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
const app = getApp();
var util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    timeSelectType: '', //时间选择器类型
    timeShowType: 'datetime', //时间选择器展示类型-时间
    updateImages: [], //选中的图片链接
    activityData: {}, //表单数据
    timeSelectShow: false,
    radioSelectShow: false,
    ageSelectShow: false,
    checkboxSelectShow: false,
    startTimeSelectDate: {}, //时间选择器初始数据
    endTimeSelectDate: {}, //时间选择器初始数据
    timeSelectDate: {},
    radioData: {}, //单选选择器初始数据
    currentAge: {
      maxAge: '无限制',
      minAge: '无限制',
      minIndex: 1,
      maxIndex: 1
    }, //年龄选择器初始数据
    checkboxData: [], //复选选择器初始数据
    isDialog: false,
    isPopup: false,
    formId: '',
    checkboxList: [],
    sexData: {
      current: "0",
      type: "sex",
      data: [{
        name: "性别不限",
        id: "0",
      }, {
        name: "男",
        id: "1",
      }, {
        name: "女",
        id: "2",
      }]
    },
    costData: {
      current: "1",
      type: "cost",
      data: [{
        name: "AA制",
        id: "0",
      }, {
        name: "免费",
        id: "1",
      }]
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        if (res.data == '') {
          Dialog.confirm({
            title: `请先完成登录！`,
            confirmButtonText: '跳转'
          }).then(() => {
            wx.navigateTo({ url: `/pages/login/login` })
          }).catch(() => {
            wx.navigateBack({ delta: 1 });
          });
        }
      }
    })
    if (options.formId && options.formId !== '') {
      this.setData({
        formId: options.formId
      });
      this.getActivtiyData();
    } else {
      this.data.activityData = {
        images: [],
        ageRange: '无限制',
        minAge: '0',
        maxAge: '0',
        sex: '0',
        cost: '1'
      }
      this.setData({
        activityData: this.data.activityData
      });
    }
    this.getActivityType();
    this.setData({ //初始化时间数据
      startTimeSelectDate: {
        minDate: new Date().getTime() + 3600000,
        maxDate: new Date(new Date().getFullYear() + 3, 11, 30).getTime(),
        currentDate: new Date().getTime() + 3600000
      },
      endTimeSelectDate: {
        minDate: new Date().getTime() + 3600000,
        maxDate: new Date(new Date().getFullYear() + 3, 11, 30).getTime(),
        currentDate: new Date().getTime() + 3600000
      }
    })
  },

  //获取活动数据
  getActivtiyData() {
    wx.showLoading({
      title: '加载中...'
    })
    let that = this;
    wx.cloud.callFunction({
      name: 'getSaveActivityDetail',
      data: {
        id: that.data.formId
      }
    }).then(res => {
      console.log(res);
      wx.hideLoading();
      if (res.result.errMsg.split(':')[1] == 'ok') {
        let result = res.result.data[0];
        result.description.activityLable = result.description.activityTypeName.split(',');
        that.data.sexData.current = result.description.sex;
        that.data.costData.current = result.description.cost;
        that.data.startTimeSelectDate.currentDate = new Date(result.description.startTime).getTime()
        that.data.endTimeSelectDate.currentDate = new Date(result.description.endTime).getTime()

        result.description.maxAge == '无限制' ?
          (that.data.currentAge.maxIndex = 1) :
          (that.data.currentAge.maxIndex = Number(result.description.maxAge - 16))
        result.description.minAge == '无限制' ?
          (that.data.currentAge.minIndex = 1) :
          (that.data.currentAge.minIndex = Number(result.description.minAge - 16))
        that.data.currentAge.maxAge = result.description.maxAge;
        that.data.currentAge.minAge = result.description.minAge;

        that.setData({
          activityData: result.description,
          updateImages: result.description.images,
          sexData: that.data.sexData,
          costData: that.data.costData,
          currentAge: that.data.currentAge,
          checkboxData: result.description.activityType
        })
        console.log(that.data.activityData, that.data.sexData);
      } else {
        Dialog.alert({
          title: `${res.result.errMsg}`
        })
      }
    }).catch(err => {
      wx.hideLoading();
      Dialog.alert({
        title: `${err}`
      })
    })
  },
  //发布图片/视频
  openSystemFile() {
    if (this.data.updateImages.length >= 9) {
      Dialog.alert({
        title: `发布图片/视频最多9张！`
      })
      return;
    }
    this.setData({
      isPopup: true
    })
  },
  //取消弹出层
  onClose() {
    this.setData({
      isPopup: false
    });
  },
  //选择图片
  updatePhoto() {
    let that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        let photoData = [];

        for (let i = 0; i < res.tempFilePaths.length; i++) {
          let photo = {
            path: '',
            isUpLoad: 0,
            progress: 0,
            type: 'photo'
          };
          photo.path = res.tempFilePaths[i]
          photoData.push(photo);
        }
        that.data.updateImages = that.data.updateImages.concat(photoData);
        that.setData({
          updateImages: that.data.updateImages.slice(0, 9),
          isPopup: false
        })
        that.updateImages();
      }
    })
  },
  //上传视频
  updateVideo() {
    let that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: ['front', 'back'],
      success: function(res) {
        let video = {
          path: '',
          isUpLoad: 0,
          progress: 0,
          type: 'video'
        };
        video.path = res.tempFilePath;
        that.data.updateImages = that.data.updateImages.concat([video]);
        that.setData({
          updateImages: that.data.updateImages,
          isPopup: false
        })
        that.updateImages();
      }
    })
  },

  //上传图片
  updateImages() {
    let that = this;
    let result = that.data.updateImages;
    for (let i = 0; i < result.length; i++) {
      if (result[i].isUpLoad == 0 || result[i].isUpLoad == 3) {
        result[i].isUpLoad = 1;
        that.setData({
          updateImages: result,
          isPopup: false
        })
        wx.cloud.uploadFile({
          cloudPath: 'userAlbum/' + Date.now() + result[i].path.match(/\.[^.]+?$/)[0],
          filePath: result[i].path,
          success: res => {
            result[i].isUpLoad = 2;
            that.data.activityData.images.push({
              path: res.fileID,
              type: result[i].type
            })
            that.setData({
              updateImages: result,
              activityData: that.data.activityData
            });
          },
          fail: err => {
            result[i].isUpLoad = 3;
            result[i].progress = 0;
            that.setData({
              updateImages: result
            });
          }
        }).onProgressUpdate((res) => {
          result[i].progress = res.progress;
          that.setData({
            updateImages: result
          });
        })
      }
    }
  },

  //获取活动类型数据
  getActivityType() {
    let that = this;
    wx.cloud.callFunction({ //获取类型数据
      name: 'getActivityType',
      data: {},
      success: res => {
        that.setData({
          checkboxList: res.result.data[0].rows
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  //删除照片
  deleteImage(event) {
    let updateImages = this.data.updateImages;
    let images = this.data.activityData.images;
    for (let i = updateImages.length - 1; i >= 0; i--) {
      if (updateImages[i].path == event.detail) {
        updateImages.splice(i, 1);
      }
    }
    for (let i = images.length - 1; i >= 0; i--) {
      if (images[i].path == event.detail) {
        images.splice(i, 1);
      }
    }
    this.data.activityData.images = images;
    this.setData({
      updateImages: updateImages,
      activityData: this.data.activityData
    })
  },

  //打开时间选择器
  selectTime: function(e) {
    e.currentTarget.dataset.type == 'start' ?
      (this.setData({
        timeSelectShow: true,
        timeSelectDate: this.data.startTimeSelectDate,
        timeSelectType: e.currentTarget.dataset.type
      })) :
      (this.setData({
        timeSelectShow: true,
        timeSelectDate: this.data.endTimeSelectDate,
        timeSelectType: e.currentTarget.dataset.type,
      }));
  },

  //截至时间
  selectUptoTime() {
    let uptoTimeSelectDate = {
      minDate: this.data.startTimeSelectDate.currentDate - 86400000 * 7,
      maxDate: this.data.startTimeSelectDate.currentDate,
      currentDate: this.data.startTimeSelectDate.currentDate - 86400000
    }
    if ((new Date().getTime() - uptoTimeSelectDate.minDate) < 0){
      uptoTimeSelectDate.minDate = new Date().getTime();
    }
    if ((new Date().getTime() - uptoTimeSelectDate.currentDate) < 0){
      uptoTimeSelectDate.currentDate = this.data.startTimeSelectDate.currentDate - 3600000
    }
    if (this.data.activityData.startTime) {
      this.setData({
        timeSelectShow: true,
        timeSelectDate: uptoTimeSelectDate,
        timeSelectType: 'upto'
      })
    } else {
      Dialog.alert({
        title: '请先选择开始时间！'
      })
    }
  },
  //打开年龄选择器
  selectAge: function(e) {
    this.setData({
      ageSelectShow: true,
      currentAge: this.data.currentAge
    })
  },
  //开打单选选择器
  selectRadio: function(e) {
    e.currentTarget.dataset.type == 'sex' ?
      (this.setData({
        radioData: this.data.sexData
      })) :
      e.currentTarget.dataset.type == 'cost' ?
      (this.setData({
        radioData: this.data.costData
      })) :
      (null);
    this.setData({
      radioSelectShow: true
    })
  },
  //打开复选选择器
  selectCheckbox: function() {
    this.setData({
      checkboxSelectShow: true,
      checkboxData: this.data.checkboxData,
    })
  },
  //时间组件传递的数据
  onTimeSelect: function(e) {
    if (e.detail !== undefined) {
      this.data.timeSelectType == "start" ?
        (
          this.data.startTimeSelectDate.currentDate = e.detail,
          this.data.activityData.startTime = this.formatDateTime(new Date(e.detail)),
          (e.detail - new Date().getTime()) < 86400000
          ? (this.data.activityData.uptoTime = this.formatDateTime(new Date(e.detail - 3600000)))
          : (this.data.activityData.uptoTime = this.formatDateTime(new Date(e.detail - 86400000))),
          this.setData({
            startTimeSelectDate: this.data.startTimeSelectDate,
          })):
        this.data.timeSelectType == "end" ?
        (
          this.data.endTimeSelectDate.currentDate = e.detail,
          this.data.activityData.endTime = this.formatDateTime(new Date(e.detail)),
          this.setData({
            endTimeSelectDate: this.data.endTimeSelectDate,
          })) :
        this.data.timeSelectType == "upto" ?
        (
          this.data.activityData.uptoTime = this.formatDateTime(new Date(e.detail))
        ) :
        null
    };
    console.log(this.data.activityData);
    this.setData({
      timeSelectShow: false,
      activityData: this.data.activityData
    });
  },
  //格式化时间
  formatDateTime: function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  //输入框输入
  onInput: function(e) {
    e.currentTarget.dataset.type == "title" ?
      (this.data.activityData.title = e.detail) :
      e.currentTarget.dataset.type == "number" ?
      (this.data.activityData.number = e.detail) :
      e.currentTarget.dataset.type == "price" ?
      (this.data.activityData.price = e.detail) :
      e.currentTarget.dataset.type == "place" ?
      (this.data.activityData.place = e.detail) :
      (null);
  },
  onBlur(){
    this.setData({
      activityData: this.data.activityData
    })
  },

  //跳转编辑页面
  goPageEdit(event){
    wx.navigateTo({
      url: `/pages/edit/edit?type=${event.currentTarget.dataset.type}&value=${event.currentTarget.dataset.value}`
    })
  },
  //下页面返回来的数据
  getEdit(value,type){
    console.log(value,type);
    type == "rule" 
    ? (this.data.activityData.rule = value,
      this.setData({ activityData: this.data.activityData }))
    : type == "warn"
    ? (this.data.activityData.warn = value,
      this.setData({ activityData: this.data.activityData }))
    : (null);
    console.log(this.data.activityData);
  },

  //跳转页面
  goPage: function(e) {
    if (!this.data.activityData.areaCode) {
      this.data.activityData.areaCode = ''
    };
    if (!this.data.activityData.address) {
      this.data.activityData.address = ''
    };
    wx.navigateTo({
      url: `/pages/address/address?areaCode=${this.data.activityData.areaCode}&address=${this.data.activityData.address}`
    })
  },
  //地址选择页面传递来的数据
  addressEvent: function(address, areaCode) {
    this.data.activityData.address = address;
    this.data.activityData.areaCode = areaCode;
    this.data.activityData.city = address.split('/')[1];
    this.setData({
      activityData: this.data.activityData
    })
  },
  //年龄选择器
  onAgeSelect: function(e) {
    console.log(e);
    if (e.detail !== undefined) {
      this.data.activityData.minAge = e.detail.minAge;
      this.data.activityData.maxAge = e.detail.maxAge;
      e.detail.minAge == '无限制' && e.detail.maxAge == '无限制' ?
        (this.data.activityData.ageRange = '无限制') :
        (this.data.activityData.ageRange = e.detail.minAge + '~' + e.detail.maxAge)
      this.setData({
        activityData: this.data.activityData,
        currentAge: e.detail
      })
    }
    this.setData({
      ageSelectShow: false,
    })
    console.log(this.data.activityData);
  },
  //单选组件传递的数据
  onRadioSelect: function(e) {
    console.log(e);
    if (e.detail !== undefined) {
      e.detail.type == 'sex' ?
        (this.data.activityData.sex = e.detail.id,
          this.data.sexData.current = e.detail.id) :
        e.detail.type == 'cost' ?
        (this.data.activityData.cost = e.detail.id,
          this.data.costData.current = e.detail.id) :
        (null);
      this.setData({
        activityData: this.data.activityData,
        sexData: this.data.sexData,
      });
    }
    this.setData({
      radioSelectShow: false,
    })
  },
  //复选组件传递的数据
  onCheckboxSelect: function(e) {
    console.log(e);
    if (e.detail !== undefined) {
      this.data.activityData.activityType = e.detail.idArr;
      this.data.activityData.activityTypeName = e.detail.nameArr.join(",");
      this.setData({
        activityData: this.data.activityData,
        checkboxData: e.detail.idArr
      })
    }
    this.setData({
      checkboxSelectShow: false,
    })
  },

  // onClose() {
  //   this.setData({ isDialog: false });
  //   wx.navigateTo({
  //     url: '/pages/login/login',
  //   })
  // },

  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //使用递归的方式实现数组、对象的深拷贝
  deepClone1: function(obj) {
    //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
    var objClone = Array.isArray(obj) ? [] : {};
    //进行深拷贝的不能为空，并且是对象或者是
    if (obj && typeof obj === "object") {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key] === "object") {
            objClone[key] = this.deepClone1(obj[key]);
          } else {
            objClone[key] = obj[key];
          }
        }
      }
    }
    return objClone;
  },
  //提交
  submitData: function(collectionName, operType) {
    if (this.verification()) {
      Dialog.alert({
        title: `${this.verification()}`
      })
      return;
    }
    let activity = this.data.activityData;
    if (!activity.images) {
      activity.images = []
    };
    if (!activity.ageRange) {
      activity.ageRange = '无限制'
    };
    if (!activity.sex) {
      activity.sex = '无限制'
    };
    if (!activity.cost) {
      activity.cost = '免费'
    };
    if (!activity.price) {
      activity.price = '0'
    };
    if (!activity.rule) {
      activity.rule = ''
    };
    if (!activity.warn) {
      activity.warn = ''
    };
    this.setData({
      activityData: activity
    })
    let that = this;
    wx.getStorage({ //获取用户ID
      key: 'openid',
      success: function(resp) {
        that.data.activityData.openid = resp.data;
        wx.cloud.callFunction({
          name: collectionName,
          data: {
            id: that.data.formId,
            openid: resp.data,
            activityData: that.data.activityData
          },
          success: resp => {
            wx.hideLoading();
            console.log(resp);
            if (resp.result.errMsg.split(':')[1] == 'ok') {
              if (operType == '发布') {
                wx.navigateTo({
                  url: `/pages/subscribe/subscribe?type=release`
                })
              } else {
                Dialog.alert({
                  title: `${operType}成功！`
                }).then(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                })
              }
            } else {
              Dialog.alert({
                title: `${operType}失败！`
              })
            }
          },
          fail: err => {
            wx.hideLoading();
            Dialog.alert({
              title: `${operType}失败！`
            })
          },
        })
      },
    })
  },

  //验证是否保存过个人信息
  getUserInfo(callback) {
    wx.showLoading({
      title: '加载中...'
    });
    util.getUserInfo().then(function(res) {
      if (res.result.data[0].perject) {
        if (callback) {
          callback()
        };
      } else {
        wx.hideLoading();
        Dialog.confirm({
          title: `请先完善个人信息！`,
          confirmButtonText: '跳转'
        }).then(() => {
          wx.navigateTo({
            url: `/pages/userInfo/userInfo`
          })
        }).catch(() => {
          Dialog.close();
        });
      }
    }, function(err) {
      wx.hideLoading();
      Dialog.alert({
        title: `获取用户信息失败！`
      })
    });
  },

  submit: function() {
    this.getUserInfo(() => this.submitData('add', '发布'))
  },
  save: function() {
    this.getUserInfo(() => this.submitData('save', '保存'))
  },


  cancel: function() {
    Dialog.confirm({
      title: `确定退出`
    }).then(() => {
      wx.navigateBack({
        delta: 1
      })
    }).catch(() => {})
  },

  //非空验证
  verification: function() {
    return (!this.data.activityData.title ?
      '标题不能为空' :
      !this.data.activityData.startTime ?
      '参与时间不能为空' :
      !this.data.activityData.endTime ?
      '结束时间不能为空' :
      !this.data.activityData.address ?
      '地点不能为空' :
      !this.data.activityData.place ?
      '详细地址不能为空不能为空' :
      !this.data.activityData.number ?
      '人员数不能为空' :
      !this.data.activityData.activityType || !this.data.activityData.activityType.length > 0 ?
      '类型不能为空' :
      null
    )
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})