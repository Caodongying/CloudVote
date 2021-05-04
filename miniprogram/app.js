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
    this.getOpenID();
  },

  globalData: {
    userInfo: null,
    openid: null,
  }, 

  //wx.getUserInfo不能获取微信用户的openid。 
  // 获取用户openid
  getOpenID() {
    var app = this;
    wx.cloud.callFunction({
      name: 'getOpenid', 
      success(res) {
        console.log(res)
        console.log('云函数获取openid成功', res.result.openid)
        var openid = res.result.openid;
        app.globalData.openid = openid;
      },
      fail(res) {
        console.log('云函数获取失败', res)
      }
    })
    
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
