// pages/votetextshare/votetextshare.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //openID:0,
    voteID:0,
    userInfo:null,
    voteStatus:"投票进行中" //投票状态  注意应为""，这里是为了测试
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options){ //获取页面跳转时传递得到的参数
    //这句之后要注释掉，仅仅为了测试
    app.globalData.userInfo= wx.getStorageSync('userInfo',this.data.userInfo)
    
    this.setData({
      voteID:options.voteID,
      userInfo:app.globalData.userInfo
    })

    console.log(this.data.userInfo)
    console.log(this.data.userInfo.avatarUrl)
    this.setVoteStatus()
  },
  
  setVoteStatus(){
    //根据voteID从数据库获取当前投票信息
    let voteRecord=wx.cloud.database().collection('voteText').doc(this.data.voteID).get()
    //判断投票是否已开始
    let currentTime=app.getCurrentTime()
    if(app.getCurrentDate()==voteRecord.dateBegin){ //日期已到
      if((currentTime>=voteRecord.timeBegin)&&(currentTime<=voteRecord.timeEnd)){
        this.data.voteStatus="投票进行中"
      }
    }
    else{
      this.data.voteStatus="投票还未开始"
    }
  }
})