// pages/votetextfinished/votetextfinished.js
Page({

  data: {
    voteID:"",
    voteRecord:""
  },

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    this.getVoteRecord()
  },

  getVoteRecord( ){
    let voteRecord=" "
    wx.cloud.database().collection('voteText')
      .doc(this.data.voteID)
      .get()
      .then(res=>{
        // console.log("查询结果为：",res.data.voteRecord)
        voteRecord=res.data.voteRecord
        this.setData({
          voteRecord:voteRecord
        })
      })
      .catch(console.error)
  },
})