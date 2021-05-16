// pages/candidateDetail/candidateDetail.js
const app=getApp()
Page({
  data: {
    voteID:0,
    candidateID:0, //参赛选手的openID
    candidateInfo:"",
    voteRecord:"",
    candidateIndex:0,//参赛选手编号
  },

 
  onLoad: function (options) {
    console.log(options)
    this.setData({
      voteID:options.voteID,
      candidateID:options.candidateID,
      candidateIndex:parseInt(options.index)+1
    })
    this.getCandidate()
    this.getVoteRecord()
  },

  getCandidate(){
    let that=this
    wx.cloud.database().collection('candidate')
      .where({
        _openid:that.data.candidateID
      })
      .get()
      .then(res=>{
        that.setData({
          candidateInfo:res.data[0]
        })
        console.log(that.data.candidateInfo)
      })
      .catch(err => console.error(err))
  },

  //评选投票名称
  getVoteRecord(callback){
    let that=this
    wx.cloud.database().collection('voteSelect')
      .doc(this.data.voteID)
      .get()
      .then(res=>{
        this.setData({
          voteRecord:res.data.voteRecord
        })
        // console.log("获取的投票信息",that.data.voteRecord)
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(
        console.error
      )
  },

  bindVideoScreenChange(e) {
    var status = e.detail.fullScreen;
    var play = {
      playVideo: false
    }
    if (status) {
      play.playVideo = true;
    } else {
      this.videoContext.pause();
    }
    this.setData(play);
  },

  //用户投票
  voteForCandidate(){
    let that=this
    var currentVoteNum=0
    var votedInfo=[]//用户已经投票的信息
    var promiseArr=[]
    //查询用户在本活动中已经投的票数
    promiseArr.push(new Promise((reslove, reject) => {
      wx.cloud.database().collection('voteSelectInfo')
        .where({
          voteID:that.data.voteID,
          voterID:app.globalData.openid
        })
        .get()
        .then(res=>{
          currentVoteNum=res.data.length
          votedInfo=res.data
          reslove()
          // console.log("信息",votedInfo)
        })
        .catch(res=>{
          console.log("查询用户已投票数失败")
          console.log(res)
        })
    }))

    Promise.all(promiseArr).then(res => {
      //判断用户是否可以接着投
      //单选投票
      if(!this.data.voteRecord.isMultiVote){
        wx.showToast({
          title:"本评选活动一人一票，您已投完！",
          icon:"none",
          duration:2000
        })
        return
      }
      //多选投票
      else{
        if(currentVoteNum<this.data.voteRecord.maxVoteNum){//还有票
          //是否已给这个人投过了
          // console.log("信息1",votedInfo)
          // console.log("dd",that.data.candidateID==votedInfo[0].candidateID)
          for(var i=0;i<votedInfo.length;i++){
            if(that.data.candidateID==votedInfo[i].candidateID){
              wx.showToast({
                title:"您已给ta投过一票，不可再投！",
                icon:"none",
                duration:2000
              })
              return
            }
          }
          wx.showModal({
            title: '提示',
            content: '是否确定要投给ta？',
            success: function (res) {
            if (res.confirm) {
              wx.cloud.database().collection('voteSelectInfo').add({
                data:{
                  voteID:that.data.voteID,
                  candidateID:that.data.candidateID,
                  voterID:app.globalData.openid
                }
              })
              .then(res=>{
                console.log("报名信息上传成功！")
                //发布完成
                wx.showToast({
                  title:'投票成功！',
                  duration:2000
                })
              })
              .catch(res=>{
                console.log("报名信息上传失败")
                //发布失败
                wx.showToast({
                title:'投票失败！',
                icon:'none',
                duration:2000
                })
              })
            }
            else if(res.cancel) {
              console.log('点击取消了');
              return false;    
              }
            }
          })
        }
        else{
          wx.showToast({
            title:"本评选活动一人最多投"+that.data.voteRecord.maxVoteNum+"票，您已投完！",
            icon:"none",
            duration:2000
          })
          return
        }
      }
    })
  }
})