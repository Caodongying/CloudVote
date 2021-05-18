// pages/asCandidate/asCandidate.js
Page({
  data: {
    voteSelect:[],
    openid:0,
  },

  onLoad: function (options) {
    this.getOpenID(this.getVoteSelect)
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

  getVoteSelect(){
    let that=this
    wx.cloud.callFunction({
      name:'getAsCandidate',
      data:{
        voterID:that.data.openid
      }
    })
    .then(res=>{
      console.log("ddd",res)
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