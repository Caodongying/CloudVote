// pages/votetemplate/votetemplate.js
const app = getApp();

Page({
  data: {
    templateID:"",
    template:"",
    currentDate:" ",//当前日期  
    isSetDateEnd:false,//已设置结束日期
    isSetDateBegin:false,
    isSetTimeBegin:false,//已设置开始时间
    isSetTimeEnd:false,
    voteRecord:{
      cover:"",
      title:'',
      description:'', //活动介绍
      dateBegin: "请选择", //开始日期
      timeBegin: "请选择", //开始时间
      dateEnd: "请选择", //结束日期
      timeEnd: "请选择", //结束时间
      startDate:" ", //开始日期的开始范围
      startTime:" ", //开始时间的开始范围
      _startTime:"", //结束时间的开始范围
      _startDate:"",//结束日期的开始范围
      isMultiVote:false, //是否为多选投票*
      maxVoteNum:"",
      isRankVisible:false, //排行榜是否可见*
      isShowOnBoard:false,//是否展示在主页
      isShowSponsor:false,//是否展示主办方信息
      sponsorName:"",//主办方名字
      sponsorTel:"",//主办方电话
      isEnroll:false,//是否开放报名
      isNeedTel:false,//参赛者是否要填写手机号
      isNeedImg:false,//参赛者是否需要上传图片
      isNeedVedio:false,//参赛者是否需要上传视频
      maxImg:"0",//参赛者最多可以上传的图片数量
    }
  },


  onLoad(options) {
    let date=app.getCurrentDate()
    //接受从上一页面传来的参数——模板ID
    // console.log(options.templateID)
    this.setData({
      templateID:options.templateID,
      currentDate:date,
      ['voteRecord.startDate']:date,
      ['voteRecord._startDate']:date
    })
    this.getTemplate()
  },

  getTemplate(){
    let that=this
    wx.cloud.database().collection('template')
      .doc(this.data.templateID)
      .get()
      .then(res=>{
        // console.log("模板查询结果",res)
        that.setData({
          template:res.data,
          ['voteRecord.cover']:res.data.coverID
        })
      })
      .catch(res=>{
        console.log("模板查询失败",res)
      })
  },


  //上传自定义封面图
  userDefinedCover(){
    // console.log(this.data.voteRecord.cover)
    // console.log(this.data.template.coverID)
    let that=this
    var tempFilePaths=""
    //选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) {    
        //上传图片至云存储
        //获取当前时间戳，作为封面图名字成分
        var timeStamp = (new Date()).valueOf()
        wx.cloud.uploadFile({
          cloudPath: 'userDefinedCovers/'+app.globalData.openid+timeStamp+'.png',
          filePath: res.tempFilePaths[0], 
        })
        .then(res => {
            //封面图地址为云存储中的地址
            that.setData({
              ['voteRecord.cover']:res.fileID
            })
            wx.showToast({
              title:"上传成功！",
              duration:2000
             })
        })
        .catch(res => {
            console.log("shibia",res)
        })

      }
    })  
  },



  activityTitle(e){
     this.setData({
       ['voteRecord.title']:e.detail.value  //用setData进行对象属性的赋值
     })
   }, 
 
   activityDescription(e){
     this.setData({
       ['voteRecord.description']:e.detail.value
     })
   }, 
 
   bindBeginDateChange(e){ //开始日期
    this.setData({
      ['voteRecord.dateBegin']:e.detail.value,
      isSetDateBegin:true,
      ['voteRecord.timeBegin']:"请选择",
      ['voteRecord.startTime']:" "
    })
    if(this.data.currentDate==this.data.voteRecord.dateBegin){ //开始日期为今日，则开始时间不晚于当前时间
      var currentTime=app.getCurrentTime()
      this.setData({
        ['voteRecord.startTime']:currentTime
      })
    }
    // console.log("结束日期："+ this.data.voteRecord.dateEnd+"开始日期"+this.data.voteRecord.dateBegin)
    var date1 = new Date(this.data.voteRecord.dateEnd)
    var date2 = new Date(this.data.voteRecord.dateBegin)
    // console.log(date1<date2)
    // console.log(this.data.isSetDateEnd)
    if(this.data.isSetDateEnd&&(date1<date2)){
      this.setData({ 
        ['voteRecord.dateEnd']:"请选择",//先行填写的结束日期无效
        ['voteRecord.timeEnd']:"请选择",
        ['voteRecord._startDate']:e.detail.value//结束日期不得晚于开始日期
      })
    }else if(!this.data.isSetDateEnd){//还没有先行设置时间
      this.setData({ 
        ['voteRecord._startDate']:e.detail.value//结束日期不得晚于开始日期
      })
    }


    console.log(this.data.voteRecord.startDate)
  },

  bindBeginTimeChange(e){ //开始时间
    if(!this.data.isSetDateBegin){
      wx.showToast({
        title:"请先设置开始日期！",
        icon:'none'
      })
      return
    }

    this.setData({
      ['voteRecord.timeBegin']:e.detail.value,
      isSetTimeBegin:true
    }) 

    this.judgeTime()
  },

  bindEndDateChange(e){ //结束日期

    this.setData({
      ['voteRecord.dateEnd']:e.detail.value,
      isSetDateEnd:true,
      ['voteRecord.timeEnd']:"请选择",
      ['voteRecord._startTime']:" "
    })

    if(this.data.isSetTimeBegin){ //已经设置开始时间
      this.judgeTime()
    }
  },

  judgeTime(){
    if(this.data.voteRecord.dateEnd==this.data.voteRecord.dateBegin){ //开始日期和结束日期一样，则结束时间不能晚于开始时间
      
      if(this.data.voteRecord.isSetTimeEnd && (this.data.voteRecord.timeEnd<this.data.voteRecord.timeBegin)){ //已设置结束时间
        this.setData({
          ['voteRecord.timeEnd']:"请选择"
        })
      }

      var temp=this.data.voteRecord.timeBegin.split(":")
      temp[1]=parseInt(temp[1])+1
      temp[1].toString()
      let _timeEnd=temp[0]+":"+temp[1]
      console.log(_timeEnd)
      this.setData({
        ['voteRecord._startTime']:_timeEnd
      }) 
    }
  },

  bindEndTimeChange(e){ //结束时间
    if(!this.data.isSetDateEnd){
      wx.showToast({
        title:"请先设置结束日期！",
        icon:'none'
      })
      return
    }
    this.setData({
      ['voteRecord.timeEnd']:e.detail.value,
      isSetTimeEnd:true
    })

  },

  setMultiVote(e){ //是否多选投票 
    this.setData({
      ['voteRecord.isMultiVote']:e.detail
    })
  },

  setMaxVoteNum(e){
    this.setData({
      ['voteRecord.maxVoteNum']:e.detail 
    })
  },

  setRankVisible(e){
    this.setData({
     ['voteRecord.isRankVisible']:e.detail
    })
  },
  
  setShowOnBoard(e){
    this.setData({
     ['voteRecord.isShowOnBoard']:e.detail
    })
  },

  setShowSponsor(e){
    this.setData({
     ['voteRecord.isShowSponsor']:e.detail
    })
  },

  setSponsorTel(e){
    this.setData({
      ['voteRecord.sponsorTel']:e.detail
     })
  },

  setSponsorName(e){
    this.setData({
      ['voteRecord.sponsorName']:e.detail
     })
  },

  setEnroll(e){
    this.setData({
      ['voteRecord.isEnroll']:e.detail
     })
  },

  setNeedTel(e){
    this.setData({
      ['voteRecord.isNeedTel']:e.detail
     })
  },

  setNeedImg(e){
    this.setData({
      ['voteRecord.isNeedImg']:e.detail
     })
  },

  setNeedVedio(e){
    this.setData({
      ['voteRecord.isNeedVedio']:e.detail
     })
  },

  setMaxImg(e){
    this.setData({
      ['voteRecord.maxImg']:e.detail
     })
  },
  
  

  
})