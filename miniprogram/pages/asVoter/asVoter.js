// pages/asVoter/asVoter.js
Page({

  data: {
    active:0,
    voteText:[],
    voteSelect:[],
    openid:[]
  },

 
  onLoad: function (options) {
    this.getOpenID(this.getVoteText)
  },

  getOpenID(callback) {
    let that=this
    wx.cloud.callFunction({
      name: 'getOpenid',
      success(res) {
        console.log("获取到openid",res.result.openid)
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

  getVoteText(){
    let that=this
    wx.cloud.callFunction({
      name:'getAsVoter',
      data:{
        voteType:"text",
        openid:that.data.openid
      }
    })
    .then(res=>{
      console.log("文字投票调用结果",res.result)
      that.setData({
        voteText:res.result
      })
      that.getSelectVote()
    })
    .catch(console.error)
  },

  getSelectVote(){
    let that=this
    wx.cloud.callFunction({
      name:'getAsVoter',
      data:{
        voteType:"select",
        openid:that.data.openid
      }
    })
    .then(res=>{
      console.log("评选投票调用结果",res.result)
      that.setData({
        voteSelect:res.result
      })
    })
    .catch(console.error)
  },

  toVoteSelectDetail(e){
    var voteID=e.currentTarget.dataset.voteid
    wx.navigateTo({
      url:"/pages/voteselectshare/voteselectshare?voteID="+voteID
    })
  }

})