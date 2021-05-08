// pages/aftervotetemplate/aftervotetemplate.js
const app=getApp()
Page({
  data:{
    voteID:0,
    voteRecord:" ",
  },  

  onLoad(options) {
    this.setData({
      voteID:options.voteID,
      voteRecord:wx.getStorageSync('voteRecord')
    })
  },
 
})