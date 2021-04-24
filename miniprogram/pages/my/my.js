// pages/my/my.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogOnButton:true,
    userInfo:null
  },

  onGetUsrProfile(e){
    console.log("按下了按键",e);
    wx.getUserProfile({
      desc: "获取你的昵称、头像、地区及性别",
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        console.log("打印用户信息",user)
        this.setData({
          showLogOnButton:false,
          userInfo: user,
        })
        user.openid = app.globalData.openid;
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },

})