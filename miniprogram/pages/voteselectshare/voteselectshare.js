// pages/voteselectshare/voteselectshare.js
const app=getApp()

Page({
  data: {
    voteID:0,
    voteRecord:" ",
    candidateNum:0,//参与选手总人数
    voteNum:0,//累计投票
    timeStatus:"",//显示投票进行状态
    active:0,
  },

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    this.getVoteRecord()
    this.setStatus()
  },

  getVoteRecord(){
    let that=this
    wx.cloud.database().collection('voteSelect')
      .doc(this.data.voteID)
      .get()
      .then(res=>{
        this.setData({
          voteRecord:res.data.voteRecord
        })
        console.log("获取的投票信息",that.data.voteRecord)
      })
      .catch(
        console.error
      )
  },

  setStatus(){

  },

  onTabbarChange(e){
    this.setData({ 
      active:e.detail 
    })
  }


})