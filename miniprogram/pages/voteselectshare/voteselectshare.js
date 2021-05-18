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
    hasEnrolled:false,//标记用户是否已经报名
    candidateInfo:[],//所有参赛者
    voteNumArr:[],//每个参赛者的投票数
    orderedRankList:"",//排行榜
    orderedRankListInfo:[],//排行榜成员的名字和头像
    openid:0
  },

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    
    this.getOpenID(this.getVoteRecord)
    // this.getVoteRecord(this.setStatus)
    this.getCandidateNum(this.getCandidate)
    this.getVoteNum()
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

  orderedRankListInfo(){
    var _orderedRankListInfo=[]
    for(var j=0;j<this.data.orderedRankList.length;j++){ //遍历排行榜数组
      for(var i=0;i<this.data.candidateInfo.length;i++){ //遍历候选人信息
        // console.log("循环执行")
        if(this.data.orderedRankList[j]._id==this.data.candidateInfo[i]._openid){//找到了
          _orderedRankListInfo.push({
            name:this.data.candidateInfo[i].candidateRecord.name,
            avatar:this.data.candidateInfo[i].candidateRecord.candidateAvatar
          })
          // console.log("ppp",_orderedRankListInfo)
          break
        }
      }
    }
    this.setData({
      orderedRankListInfo:_orderedRankListInfo
    })
  },

  //获取参赛总人数
  getCandidateNum(callback){
    let that=this
    const db=wx.cloud.database()
    db.collection('candidate').aggregate()
      .match({
        voteID:that.data.voteID
      })
      .count('candidateNum')
      .end()
      .then(res=>{
        if(res.list.length!=0){
          that.setData({
            candidateNum:res.list[0].candidateNum
          })
        }
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(err => console.error(err))
  },

  //获取所有参赛选手
  getCandidate(){
    let that=this
    const db=wx.cloud.database()
    db.collection('candidate')
    .where({
      voteID:that.data.voteID,
      // ['candidateRecord.status']:1 //已审核通过 之后要改成2
    })
    .get()
    .then(res=>{
      that.setData({
        candidateInfo:res.data
      })
      that.getVoteNumArr()
      that.getRankList(that.orderedRankListInfo)
    })
    .catch(err => console.error(err))
  },

  //获取总票数
  getVoteNum(){
    let that=this
    const db=wx.cloud.database()
    db.collection('voteSelectInfo').aggregate()
      .match({
        voteID:that.data.voteID
      })
      .count('voteNum')
      .end()
      .then(res=>{
        if(res.list.length!=0){
          that.setData({
            voteNum:res.list[0].voteNum
          })
        }
      })
      .catch(err => console.error(err))
  },

  //获取每个参赛选手的票数
async getVoteNumArr(){
    //循环查询数据库
    var _voteNumArr=[]
    console.log("执行了getVoteNumArr")
    let that=this
    for(var i=0;i<this.data.candidateNum;i++){
      const db=wx.cloud.database()
      await db.collection('voteSelectInfo').aggregate()
        .match({
          voteID:that.data.voteID,
          candidateID:that.data.candidateInfo[i]._openid
        }) 
        .count('voteNum')
        .end()
        .then(res=>{
          if(res.list.length!=0){
            _voteNumArr.push(res.list[0].voteNum)    
            // that.setData({
            //   voteNumArr:_voteNumArr
            // })         
          }
          else{           
            _voteNumArr.push(0)
            // that.setData({
            //   voteNumArr:_voteNumArr
            // }) 
          }
        })
        .catch(err => console.error(err))
    } 

    setTimeout(function(){
      // console.log("投票信息数组，",_voteNumArr)
      that.setData({
        voteNumArr:_voteNumArr
      }) 
    },1000) 
    

  },

  //获取排行榜
  getRankList(callback){
    let that=this
    const db=wx.cloud.database()
    const $=db.command.aggregate
    db.collection('voteSelectInfo')
      .aggregate()
      .match({
        voteID:that.data.voteID
      })
      .group({
        _id:'$candidateID',
        sumVotes:$.sum(1)
      })
      .sort({
        sumVotes:-1
      })
      .end()
      .then(res => {
        // console.log(res)
        this.setData({
          orderedRankList:res.list
        })
        console.log("排行榜查询结果",that.data.orderedRankList)
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(err => console.error(err))
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
        that.setStatus()
        // console.log("获取的投票信息",that.data.voteRecord)
        if(typeof callback != "undefined")
          callback();// 执行调用函数
      })
      .catch(
        console.error
      )
  },

  setStatus(){
     //判断是否已经报名过
     const db=wx.cloud.database()
     let that=this
     db.collection('candidate').where({
       _openid:that.data.openid,
       voteID:that.data.voteID
     })
     .get( )
     .then(res=>{
       if(res.data.length>0){//已经投票
        console.log("哭了",res)
         that.setData({
           hasEnrolled:true,
         })
         
       }
     })
     .catch(console.error)

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


  //点击“我要报名”
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

  //点击“查看报名信息”
  onCheckEnrollInfo(){
    let that=this
    var candidateID=this.data.openid
    var index=-1
    for(var i=0;i<this.data.candidateInfo.length;i++){
      if(this.data.candidateInfo[i]._openid==candidateID){
        index=i
        break
      }
    }
    var candidateInfo=this.data.candidateInfo[index]
    //还要传递票数与排名
    var voteNum=this.data.voteNumArr[index]
    var rankNum="—"
    for(var i=0;i<this.data.orderedRankList.length;i++){
      if(candidateID==this.data.orderedRankList[i]._id){
        rankNum=i+1
        break
      }
    }
    wx.navigateTo({
      url:"/pages/candidateDetail/candidateDetail?voteID="+that.data.voteID+"&candidateID="+candidateID+"&index="+index+"&voteNum="+voteNum+"&rankNum="+rankNum
    }) 
  },

  //查看选手信息
  candidateDetail(e){
    let that=this
    var index=e.currentTarget.dataset.index
    var candidateInfo=this.data.candidateInfo[index]
    var candidateID=candidateInfo._openid
    //还要传递票数与排名
    var voteNum=this.data.voteNumArr[index]
    var rankNum="—"
    for(var i=0;i<this.data.orderedRankList.length;i++){
      if(candidateID==this.data.orderedRankList[i]._id){
        rankNum=i+1
        break
      }
    }
    wx.navigateTo({
      url:"/pages/candidateDetail/candidateDetail?voteID="+that.data.voteID+"&candidateID="+candidateID+"&index="+index+"&voteNum="+voteNum+"&rankNum="+rankNum
    }) 
  }

})