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

  onShow(){
    console.log("在my界面的userInfo",app.globalData.userInfo)
    // let bol=this.data.showLogOnButton
    if(app.globalData.userInfo){ //已经授权登录了
      this.setData({
        showLogOnButton:false,
        userInfo:app.globalData.userInfo
      })
    }
  },

  // delAllVoteTextInfo(){
  //   const db=wx.cloud.database()
  //   const _=db.command
  //   db.collection('voteTextInfo').where({
  //     voteID:_.exists(true)
  //   }).remove()
  //   .then(res=>{console.log("删除全表",res)})
  // },

  onGetUsrProfile(e){
    // console.log("按下了按键",e);
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
        app.globalData.userInfo=this.data.userInfo
          wx.cloud.database().collection('user')
          .add({
            data:{
              userInfo:app.globalData.userInfo
            }
          })
          .then(console.log("用户信息上传成功"))
          .catch()
        // this.delAllVoteTextInfo()
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      } 
    })  
  },

})