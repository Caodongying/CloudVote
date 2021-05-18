// pages/asCreator/asCreator.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    voteText:[],
    voteSelect:[],
    openid:0,
  },

  onLoad(){
    this.getOpenID(this.getVoteText)
    
  },

  getOpenID(callback) {
    let that=this
    var _openid="";
    wx.cloud.callFunction({
      name: 'getOpenid',
      success(res) {
        that.setData({
          openid:res.result.openid
        })
        if(typeof callback != "undefined")
          callback();
      },
      fail(res) {
        console.log('云函数获取失败', res)
      }
    })
  },

  //获取文字投票
  getVoteText(){
    let that=this
    wx.cloud.database().collection('voteText')
    .where({
      _openid:that.data.openid
    })
    .field({
      _id:true,
      ['voteRecord.title']:true
    })
    .get()
    .then(res=>{
      that.setData({
        voteText:res.data
      })
      that.getVoteSelect()
    })
    .catch(console.error)
  },

  getVoteSelect(){
    let that=this
    wx.cloud.database().collection('voteSelect')
    .where({
      _openid:that.data.openid
    })
    .field({
      _id:true,
      ['voteRecord.title']:true,
      ['voteRecord.cover']:true
    })
    .get()
    .then(res=>{
      that.setData({
        voteSelect:res.data
      })
    })
    .catch(console.error)
  },

  toVoteSelectDetail(e){
    var voteID=e.currentTarget.dataset.voteid
    wx.navigateTo({
      url:"/pages/aftervotetemplate/aftervotetemplate?voteID="+voteID
    })
  }
})