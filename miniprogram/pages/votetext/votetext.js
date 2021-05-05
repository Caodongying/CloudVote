
const app = getApp();

Page({

  data:{
    showMinus:true,
    showPlus:true,  
    currentDate:" ",//当前日期  
    isSetDateEnd:false,//已设置结束日期
    isSetDateBegin:false,
    isSetTimeBegin:false,//已设置开始时间
    isSetTimeEnd:false,
    voteRecord:{ //一场投票
      title:'', //活动标题
      description:'', //活动介绍
      voteOption:[ //选项
        {"content":""},
        {"content":"" },
        {"content":"" },
      ],
      dateBegin: "请选择", //开始日期
      timeBegin: "请选择", //开始时间
      dateEnd: "请选择", //结束日期
      timeEnd: "请选择", //结束时间
      startDate:" ", //开始日期的开始范围
      startTime:" ", //开始时间的开始范围
      _startTime:"", //结束时间的开始范围
      _startDate:"",//结束日期的开始范围
      isMultiVote:false, //是否为多选投票*
      minVoteNum:1,
      maxVoteNum:"",
      //isNumVisible:false, //投票数量是否可见*
      isRankVisible:false, //排行榜是否可见*
      isAnonymous:false //是否匿名*
    },
  },

  onLoad(){
    // console.log("点击之前",this.data.voteRecord.voteOption)
    // console.log(app.globalData.openid)
    let date=app.getCurrentDate()
    this.setData({
      currentDate:date,
      ['voteRecord.startDate']:date,
      ['voteRecord._startDate']:date
    })
    //console.log(this.data.voteRecord.startTime)
    this.initValidate()
    
  },

  initValidate(){ //表单验证初始化
    const rules={ //参数-rules
      title:{
        required:true//确保已填写
      },
      description:{
        required:true
      },
      // voteOption:{
      //   required:true
      // },
        
      dateBegin:{
        required:true,
        date:true
      },
      timeBegin:{
        required:true,
        contains: ':'
      },
      dateEnd:{
        required:true,
        date:true
      },
      timeEnd:{
        required:true,
        contains: ':'
      },
    }
    const messages={ //参数-messages
      title:{
        required:'请填写活动标题'
      },
      description:{
        required:'请填写活动介绍'
      },
      // voteOption:{
      //   required:'请将选项填写完整，或移除空选项'
      // },
      dateBegin:{
        required:'请选择开始日期',
        date:'请选择开始日期'
      },
      timeBegin:{
        required:'请选择开始时间',
        contains:"请选择开始时间"
      },
      dateEnd:{
        required:'请选择结束日期',
        date:'请选择结束日期'
      },
      timeEnd:{
        required:'请选择结束时间',
        contains:'请选择结束时间'
      }
    }
    this.wxValidate=app.wxValidate(rules,messages) //调用函数并传参
  },


  activityTitle(e){
   // console.log("e的详情为：",e.detail.value)
    this.setData({
      ['voteRecord.title']:e.detail.value  //用setData进行对象属性的赋值
    })
  }, 

  activityDescription(e){
    //console.log("title的值为",this.data.voteRecord.title)
    this.setData({
      ['voteRecord.description']:e.detail.value
    })
  }, 

  optionContent(e){ 
    let index=e.currentTarget.dataset.index //注意data-value传参忽略大小写！！
    // let string='voteRecord.voteOption['+index+'].content'
    // console.log(e)
    // console.log(e)
    this.setData({
      [`voteRecord.voteOption[${index}].content`]:e.detail
    })


    // this.setData({
    //   string:e.detail.value
    // })

    //this.data.voteRecord.voteOption[${index}].content=e.detail.value 
    console.log(this.data.voteRecord.voteOption)
  },

  addOption(){  //这是正确的写法
    let _voteOption=this.data.voteRecord.voteOption
    _voteOption.push({"content":" " })
    this.setData({
      ['voteRecord.voteOption']:_voteOption
    })
    //console.log("点击之后",this.data.voteRecord.voteOption)
  },

  // addOption1( ){  //这是错误的写法，因为push后变成了数值，数值也可以用wx:for
  //   let _voteOption=this.data.voteRecord.voteOption.push({"content":" " })
  //   console.log(_voteOption)
  //   this.setData({
  //     ['voteRecord.voteOption']:_voteOption
  //   })
  //   //console.log("点击之后",this.data.voteRecord.voteOption)
  // }
  
  deleteOption(e){
    //至少要留两个选项
    if(this.data.voteRecord.voteOption.length==2){ //只剩两个选项，关闭删除操作
      return
    }
    //获取要取消的选项的下标
    let index=e.currentTarget.dataset.index
    console.log("要取消的下标：",index) 
    let _voteOption=this.data.voteRecord.voteOption
    // console.log("删除前的数组voteOption:",this.data.voteRecord.voteOption)
    console.log("删除前的数组_voteOption:",_voteOption)
    _voteOption.splice(index,1)
    console.log("删除后的数组_voteOption",_voteOption)
    this.setData({
      ['voteRecord.voteOption']:_voteOption
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
    console.log("结束日期："+ this.data.voteRecord.dateEnd+"开始日期"+this.data.voteRecord.dateBegin)
    var date1 = new Date(this.data.voteRecord.dateEnd)
    var date2 = new Date(this.data.voteRecord.dateBegin)
    console.log(date1<date2)
    console.log(this.data.isSetDateEnd)
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

  setMinVoteNum(e){
    this.setData({
      ['voteRecord.minVoteNum']:e.detail
    })
  },

  setMaxVoteNum(e){
    this.setData({
      ['voteRecord.maxVoteNum']:e.detail 
    })
  },
  // setNumVisible(e){
  //   this.setData({
  //     ['voteRecord.isNumVisible']:e.detail
  //   })
  // },

  setRankVisible(e){
    this.setData({
     ['voteRecord.isRankVisible']:e.detail
    })
  },

  setAnonymous(e){
    this.setData({
      ['voteRecord.isAnonymous']:e.detail
    })
  },

  voteSubmit(e){ //表单提交
     //1-表单校验
     console.log('form发生了submit事件，携带的数据为：', e.detail.value)
 
     if(!this.wxValidate.checkForm(e.detail.value)){ //表单选项外的部分有问题
      const error=this.wxValidate.errorList[0]
      console.log(error)
      wx.showToast({
        title: `${error.msg}`,
        icon:'none',
        duration:2000
      })
      return false
    }

    //由于选项是一个数组，用wxValidate难以实现，所以单独进行验证
    let _voteOption=this.data.voteRecord.voteOption
    console.log(_voteOption)
    let isOptionsFull=true
    for(var i=0;i<_voteOption.length;i++){
      if(_voteOption[i].content.match(/^[ ]*$/)){//有选项为空
       isOptionsFull=false
      }
    }  

    if(!isOptionsFull){ //选项有问题
      wx.showToast({
        title: "请将所有选项填写完整，或移除空选项",
        icon:'none',
        duration:2000
      })
      return false
    }
     
    //表单正确 
    //2-缓存表单至本地
     wx.setStorageSync('voteRecord',this.data.voteRecord)

     //3-上传表单至数据库
     wx.showLoading({
       title: '正在发布···',
     })

     //发布过程

     wx.cloud.database().collection('voteText').add({
      data:{
        voteRecord:wx.getStorageSync('voteRecord')
      }
     })
     .then(res=>{
      console.log("投票表单上传成功！")
      console.log(res)
      //发布完成
      wx.hideLoading( )
      wx.showToast({
        title:'发布成功！',
        duration:2000
      })
      //跳转到投票详情页
      wx.navigateTo({
        url: '/pages/aftervotetext/aftervotetext?voteID='+res._id
        //url: '/pages/aftervotetext/aftervotetext?voteID=&voteRecord='+res._id+JSON.stringify(this.data.voteRecord)
      })

     })
    .catch(res=>{
      console.log("投票表单上传失败")
      //发布失败
      wx.hideLoading( )
      wx.showToast({
      title:'发布失败！',
      icon:'none',
      duration:2000
      })
     })


     
  }
  
})