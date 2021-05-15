// pages/voteselectshare/voteselectshare.js
const app=getApp()

Page({
  data: {
    voteID:0,
    voteRecord:" ",
    candidateNum:0,//参与选手总人数
    voteNum:0,//累计投票
    timeStatus:"",//显示投票进行状态
    active1:0,
    active2:0,
  },

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    this.getVoteRecord(this.setStatus)
  },

  getVoteRecord(callback){
    let that=this
    wx.cloud.database().collection('voteSelect')
      .doc(this.data.voteID)
      .get()
      .then(res=>{
        this.setData({
          voteRecord:res.data.voteRecord
        })
        console.log("获取的投票信息",that.data.voteRecord)
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(
        console.error
      )
  },

  setStatus(){
    let enrollDate=this.data.voteRecord.dateBegin1 //报名开始日期
    let enrollTime=this.data.voteRecord.timeBegin1 //报名开始时间
    let voteDate=this.data.voteRecord.dateBegin//投票开始时间
    let voteTime=this.data.voteRecord.timeBegin //投票开始时间
    let enrollDate1=this.data.voteRecord.dateEnd1 //报名结束日期
    let enrollTime1=this.data.voteRecord.timeEnd1 //报名结束时间
    let voteDate1=this.data.voteRecord.dateEnd//投票结束时间
    let voteTime1=this.data.voteRecord.timeEnd //投票结束时间
    let currentDate=app.getCurrentDate()
    let currentTime=app.getCurrentTime()
    var date1=""
    var date2 = new Date(currentDate) //date2为当前日期
    var date3=""
    if(this.data.voteRecord.isEnroll){ //开放报名
      date1 = new Date(enrollDate) //date1为报名开始日期
      date3 = new Date(enrollDate1) //date3为报名结束日期

      if(date2<date1){ //现在还没有到报名开始那天
        this.setData({
          timeStatus:"报名还未开始"
        })
      }
      else if(date2==date1){//已经到了报名那天
        if(currentTime<enrollTime){//时间还没到
          this.setData({
            timeStatus:"报名还未开始"
          })
        }
      }
      else if(date2>date3){//现在已经过了报名结束那天
        this.setData({
          timeStatus:"报名已经结束"
        })
      }
      else if(date2==date3){//已经到了报名结束那天
        if(currentTime>enrollTime1){//时间已经过了报名结束时间
          this.setData({
            timeStatus:"报名已经结束"
          })
        }
      }
      else{
        this.setData({
          timeStatus:"报名正在进行中"
        })
      }
      
    }
    
    //报名结束，判断投票时间
    if((this.data.timeStatus=="报名已经结束")||(!this.data.voteRecord.isEnroll)){
      date1 = new Date(voteDate)//date1为投票开始日期
      date3 = new Date(voteDate1)//date3为投票结束日期

      if(date2<date1){ //现在还没有到投票开始那天
        this.setData({
          timeStatus:"投票还未开始"
        })
      }
      else if(date2==date1){//已经到了报名那天
        this.setData({
          timeStatus:"投票还未开始"
        })
      }
      else if(date2>date3){//现在已经过了投票结束那天
        this.setData({
          timeStatus:"投票已经结束"
        })
      }
      else if(date2==date3){//已经到了投票结束那天
        if(currentTime>voteTime1){//时间已经过了投票结束时间
          this.setData({
            timeStatus:"投票已经结束"
          })
        }
      }
      else{
        this.setData({
          timeStatus:"投票正在进行中"
        })
      }

    }
  },

  onEnroll(){
    if(this.data.timeStatus=="报名还未开始"){
      wx.showToast({
        title:"报名还未开始！",
        icon:"none",
        duration:2000
      })
      return
    }
    else if(this.data.timeStatus=="报名正在进行中"){
      wx.navigateTo({
        url:"/pages/selectenroll/selectenroll?voteID="+this.data.voteID
      })
    }
    else{
      wx.showToast({
        title:"报名已经结束！",
        icon:"none",
        duration:2000
      })
      return
    }
    
  },


})