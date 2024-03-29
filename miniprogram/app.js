//app.js

import wxValidate from 'WxValidate.js'

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'graduation-voteapp-9drdj3462e4b2',
        traceUser: true,
      })
    }
    this.getOpenID(this.getUserInfo)
  },

  globalData: {
    userInfo: null,
    openid: null,
  }, 

  getUserInfo(){
    var app=this
    wx.cloud.database().collection('user')
      .where({
        _openid:this.globalData.openid
      })
      .get()
      .then(res=>{
        if(res.data.length!=0){       
            this.globalData.userInfo=res.data[0].userInfo
            // console.log(this.globalData.userInfo)
        }
      })
      .catch(console.error)
  },
  //wx.getUserInfo不能获取微信用户的openid。 
  // 获取用户openid
  getOpenID(callback) {
    var app = this;
   var _openid="";
   wx.cloud.callFunction({
      name: 'getOpenid',
      success(res) {
        // console.log(res)
        console.log('云函数获取openid成功', res.result.openid)
        var openid = res.result.openid;
        app.globalData.openid=openid;
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      },
      fail(res) {
        console.log('云函数获取失败', res)
      }
    })
    // .then(res=>{
    //     console.log(res)
    //     console.log('云函数获取openid成功', res.result.openid)
    //     var openid = res.result.openid;
    //     // app.globalData.openid=openid;
    //     _openid=openid
    //     return;
    //     //return openid
    // })
    // .catch(res=>{
    //   console.error()
    // })
    // return _openid
  },

  
  getCurrentDate(){ //获取当前日期
    var timeStamp=Date.parse(new Date())
    timeStamp=timeStamp/1000
    var n=timeStamp*1000
    var date=new Date(n) 
    var _year=date.getFullYear();//年
    var _month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //月
    var _day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();//日
    var currentDate=_year+"-"+_month+"-"+_day
    return currentDate
  },

  wxValidate:(rules,messages)=>new wxValidate(rules,messages),

  getCurrentTime(){ //获取当前时间
    var timeStamp=Date.parse(new Date())
    timeStamp=timeStamp/1000
    var n=timeStamp*1000
    var date=new Date(n) 
    var _hour=date.getHours()
    var _minute=date.getMinutes()
    var currentTime=_hour+":"+_minute
    return currentTime
  },
 
})
