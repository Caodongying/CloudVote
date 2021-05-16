// pages/votetextshare/votetextshare.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:0,
    voteID:" ",//值应为0，这里是为了方便测试，之后要修改
    userInfo:null,
    voteStatus:"", 
    voteRecord:"",
    anonymousStatus:"", //匿名状态
    multiStatus:"",//多选状态
    optionVoted:[],//选中的投票项
    isFirst:true,//是否是第一次投票
    showRankList:false,
    orderedRankList:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options){ //获取页面跳转时传递得到的参数
    //这句之后要注释掉，仅仅为了测试
    // app.globalData.userInfo= wx.getStorageSync('userInfo',this.data.userInfo)
    this.setData({
      voteID:options.voteID,
      userInfo:app.globalData.userInfo
    })

    // console.log(this.data.userInfo)
    // console.log(this.data.userInfo.avatarUrl)
    this.getVoteRecord(this.setStatus)
    this.getOpenID()
    this.judgeIsFirst()
    this.getRankList()
  },

  //其实在app.js中已定义getOpenID，但是由于js异步的问题，无法在then函数中直接返回值
  //相关的解决方法是回调/async/返回promise对象。我暂时没学懂（其实没学，看了眼不是很懂就跳过了，要写不完了！）
  //讲解链接：https://www.wenyuanblog.com/blogs/javascript-how-to-return-value-in-promise.html
  getOpenID() {
    let that=this
    var _openid="";
    wx.cloud.callFunction({
      name: 'getOpenid',
      success(res) {
        console.log(res)
        console.log('云函数获取openid成功', res.result.openid)
        that.openid= res.result.openid;
      },
      fail(res) {
        console.log('云函数获取失败', res)
      }
    })
  },

  getRankList(){
    const db=wx.cloud.database()
    const $=db.command.aggregate
    db.collection('voteTextInfo')
      .aggregate()
      .match({
        voteID:this.data.voteID
      })
      .group({
        _id:'$optionIndex',
        sumOptions:$.sum(1)
      })
      .sort({
        sumOptions:-1
      })
      .end()
      .then(res => {
        // console.log(res)
        this.setData({
          orderedRankList:res.list
        })
        console.log("查询结果",this.data.orderedRankList)
      })
      .catch(err => console.error(err))
  },

  //判断是否是第一次投票，需要借助数据库
  judgeIsFirst(){
    const db=wx.cloud.database()
    // const _=db.command
    db.collection('voteTextInfo').where({
      openid:this.data.openid,
      voteID:this.data.voteID
    })
    .get( )
    .then(res=>{
      if(res.data.length>0){//已经投票
        this.setData({
          isFirst:false,
          // showRankList:true
        })
        
      }
    })
    .catch(console.error)
    
  },
  
  getVoteRecord(callback){
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
      if(voteRecord.minVoteNum==voteRecord.maxVoteNum){
        this.setData({
          multiStatus:"多选，请投"+voteRecord.minVoteNum+"票"
        })
      }
      else{
        this.setData({
          multiStatus:"多选，可投"+voteRecord.minVoteNum+"到"+voteRecord.maxVoteNum+"票"
        })
      }
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
    
  },

  viewRankList(){
    //排行榜不可见
    if(!this.data.voteRecord.isRankVisible){
      wx.showToast({
        title:"由于发布者设置，本排行榜不公开！",
        icon:"none",
        duration:2000
      })
      return
    }
    if(this.data.isFirst){
      wx.showToast({
        title:"投票后才能查看排行榜！",
        icon:"none",
        duration:2000
      })
      return
    }
    //可以查看排行榜
    this.setData({
      showRankList:true
    })
    
  },

  optionSubmit(){
    //判断是否在投票有效期内
    if(this.data.voteStatus=="投票已结束"){
      wx.showToast({
        title: "投票已结束！",
        icon:'none',
        duration:2000
      })
      return false
    }
    else if(this.data.voteStatus=="投票还未开始"){
      wx.showToast({
        title: "投票还未开始",
        icon:'none',
        duration:2000
      })
      return false
    }
    
    //判断是否已经投过
    if(!this.data.isFirst){
      wx.showToast({
        title:"您已投票，不可以再投！",
        icon:"none",
        duration:2000
      })
      return false
    }

    
    //验证是否满足最小投票数要求
    let optionnVotedNum=this.data.optionVoted.length
    if(optionnVotedNum<this.data.voteRecord.minVoteNum){
      wx.showToast({
        title: "至少要投"+this.data.voteRecord.minVoteNum+"票，请继续投票！",
        icon:'none',
        duration:2000
      })
      return false
    }

    //验证成功
    wx.showLoading({
      title: '正在提交',
    })

    //上传投票信息至数据库
    //这里要一次性上传多条信息到云数据库。为了赶DDL，我采用for循环这种笨方法，存在的问题是多次访问数据库有点慢，而且听说容易爆内存（？）
    //解决的办法是在云函数中上传一个list数组，数组中每一个元素为一个对象，即要上传的内容
    //但是用云函数有点麻烦，之前写删除操作就必须在云函数中，踩了很多坑
    //这里偷懒一下，如果之后进度能好一点的话，就优化这个地方
    let db=wx.cloud.database().collection('voteTextInfo')
    let that=this
    for(var i=0;i<this.data.optionVoted.length;i++){
      db.add({
        data:{
          openid:this.data.openid,
          voteID:this.data.voteID,
          optionIndex:i
        }
      })
      .then(res=>{
        // this.setData({
        //   isFirst:false
        // })
        wx.hideLoading( )
          //跳转到投票详情页
        wx.navigateTo({
          url: '/pages/votetextfinished/votetextfinished?voteID='+that.data.voteID
        })
      })
      .catch(res=>{
        console.log("投票信息上传失败")
        //发布失败
        wx.hideLoading( )
        wx.showToast({
        title:'提交失败！',
        icon:'none',
        duration:2000
        })
      })
    }
  }

 
})