// pages/votetextshare/votetextshare.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //openID:0,
    voteID:"79550af26090ffeb13f7430b1c7b0d2e",//值应为0，这里是为了方便测试，之后要修改
    userInfo:null,
    voteStatus:"", 
    voteRecord:"",
    anonymousStatus:"", //匿名状态
    multiStatus:"",//多选状态
    optionVoted:[]//选中的投票项
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options){ //获取页面跳转时传递得到的参数
    //这句之后要注释掉，仅仅为了测试
    app.globalData.userInfo= wx.getStorageSync('userInfo',this.data.userInfo)
    
    this.setData({
      voteID:options.voteID,
      userInfo:app.globalData.userInfo
    })

    console.log(this.data.userInfo)
    console.log(this.data.userInfo.avatarUrl)
    this.getVoteRecord(this.setStatus)
  },
  
  getVoteRecord(callback){
    let voteRecord=" "
    wx.cloud.database().collection('voteText')
      .doc(this.data.voteID)
      .get()
      .then(res=>{
        console.log("查询结果为：",res.data.voteRecord)
        voteRecord=res.data.voteRecord
        this.setData({
          voteRecord:voteRecord
        })
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(console.error)
  },

  setStatus(){
    //判断投票是否已开始
    let currentTime=app.getCurrentTime()
    let currentDate=app.getCurrentDate()
    let voteRecord=this.data.voteRecord
    if(currentDate==voteRecord.dateBegin){ //日期已到
      if((currentTime>=voteRecord.timeBegin)&&(currentTime<=voteRecord.timeEnd)){
        this.setData({
          voteStatus:"投票进行中"
        })
      }
      else if(currentTime>=voteRecord.timeEnd){ //同一天，时间已过
        this.setData({
          voteStatus:"投票已结束"
        })
      }
    }
    else if(currentDate>=voteRecord.dateEnd){ //日期已过
      this.setData({
        voteStatus:"投票已结束"
      })
    }
    else{
      this.setData({
        voteStatus:"投票还未开始"
      })
    }

    //判断是否匿名
    if(voteRecord.isAnonymous){
      this.setData({
        anonymousStatus:"匿名"
      })
    }
    else{
      this.setData({
        anonymousStatus:"实名"
      })
    }

    //判断是否多选
    if(voteRecord.isMultiVote){
      this.setData({
        multiStatus:"多选，可投"+voteRecord.minVoteNum+"到"+voteRecord.maxVoteNum+"票"
      })
    }
    else{
      this.setData({
        multiStatus:"单选"
      })
    }
  },

  chooseOption(e){
    this.setData({
      optionVoted:e.detail
    })
  }


 
})