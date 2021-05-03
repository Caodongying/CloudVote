// pages/votetextshare/votetextshare.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //openID:0,
    voteID:0,
    userInfo:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options){ //获取页面跳转时传递得到的参数
    this.setData({
      voteID:options.voteID,
      // openID:options.openID
    })
  },
  
})