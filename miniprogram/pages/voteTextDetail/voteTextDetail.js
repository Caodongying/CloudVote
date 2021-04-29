// pages/voteTextDetail/voteTextDetail.js
Page({
  data: {
    voteRecord:" "
  },

 onLoad(){
  this.setData({
    voteRecord:wx.getStorageSync('voteRecord')
  })
 },


})