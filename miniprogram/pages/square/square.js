// pages/square/square.js
Page({
  data: {
    voteSelect:[],
    openid:0,
  },

  onLoad: function (options) {
    this.getVoteSelect()
  },

  getVoteSelect(){
    let that=this
    wx.cloud.database().collection('voteSelect')
    .where({
      ['voteRecord.isShowOnBoard']:true
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
      url:"/pages/voteselectshare/voteselectshare?voteID="+voteID
    })
  }

})