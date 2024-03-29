// pages/selectenroll/selectenroll.js
const app=getApp()
Page({
  data: {
    voteID:0,
    candidateRecord:{
      candidateAvatar:"",
      picture:[],
      name:"",
      description:"",
      tel:"",
      video:"",
      status:1//报名状态，1为待审核，2为审核通过，3为被拒绝。默认状态为待审核
    },
    voteRecord:"",
    addPic:"/images/add.png",
    addVideo:"/images/video.png",
    imgArr:[],
    tempVideoPath:"",
    // uploadFlag:0
  },

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    this.getVoteRecord()
    // console.log(this.data.voteID)
    this.initValidate()
  },

  initValidate(){ 
    const rules={ //参数-rules
      title:{
        required:true//确保已填写
      },
      description:{
        required:true   
      },
      tel:{
        required:true,
        tel:true
      }
    }

    const messages={ //参数-messages
      title:{
        required:'请填写选手名称'
      },
      description:{
        required:'请填写参赛介绍'
      },
      tel:{
        required:'请填写手机号',
        tel:'请输入正确的手机号'
      },
    }
    this.wxValidate=app.wxValidate(rules,messages) //调用函数并传参
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

  candidateAvatar(){
    let that=this
    var tempFilePaths=""
    //选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) {   
        that.setData({
          ['candidateRecord.candidateAvatar']:res.tempFilePaths[0]
        })
      }
    })  
  },
  
  onCandidateName(e){
    console.log(e)
    this.setData({
      ['candidateRecord.name']:e.detail  //用setData进行对象属性的赋值
    })
  },

  onCandidateDescribe(e){
    this.setData({
      ['candidateRecord.description']:e.detail  //用setData进行对象属性的赋值
    })
  },

  onCandidateTel(e){
    this.setData({
      ['candidateRecord.tel']:e.detail  //用setData进行对象属性的赋值
    })
  },

  onAddPicture(){
    var currentPicNum=this.data.candidateRecord.picture.length
    var maxPicNum=this.data.voteRecord.maxImg
    var leftPicNum=maxPicNum-currentPicNum
    let that=this
    var tempFilePaths=""
    if(leftPicNum==0){
      wx.showToast({
        title:"最多上传"+maxPicNum+"张！",
        icon:"none",
        duration:2000
      })
      return
    }
    //选择图片
    wx.chooseImage({
      count: leftPicNum,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) { 
        var length=that.data.imgArr.length
        if(length==0){
          that.setData({
            imgArr:res.tempFilePaths
          })
        }
        else{
        that.setData({
          imgArr:that.data.imgArr.concat(res.tempFilePaths)
        })
        }
        that.setData({
          ['candidateRecord.picture']:that.data.imgArr
        })
        // console.log(that.data.imgArr)
      }
    })  
  },

  //长按图片可以删除
  deleteImage(e){
    var that = this;
    var images = that.data.candidateRecord.picture;
    var index = e.currentTarget.dataset.index;//获取当前长按图片下标
    wx.showModal({
     title: '提示',
     content: '确定要删除此图片吗？',
     success: function (res) {
      if (res.confirm) {
        console.log('点击确定了');
        images.splice(index, 1);
        that.setData({
          ['candidateRecord.picture']:images
        })
      }
      else if(res.cancel) {
        console.log('点击取消了');
        return false;    
       }
     }
    })
  },

  deleteVideo(){
    let that=this
    wx.showModal({
      title: '提示',
      content: '确定要删除视频？',
      success: function (res) {
      if (res.confirm) {
        that.setData({
        tempVideoPath:""
        })
      }
       else if(res.cancel) {
         console.log('点击取消了');
         return false;    
        }
      }
     })
    
  },

  onAddVideo(){
    console.log("点击上传视频")
    let that=this
    wx.chooseVideo({
      sourceType: ['album','camera'],
      maxDuration: 60, 
      camera: 'back'  
    })
    .then(res=> {
        console.log(res)
        that.setData({
          tempVideoPath:res.tempFilePath
        })
      })
    .catch(res=>{
      console.log(res)
    })
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

  candidateSubmit(e){
    var that=this
    //验证表单
    //是否上传头像
    if(!this.data.candidateRecord.candidateAvatar){
      wx.showToast({
        title:"请选择选手头像！",
        icon:"none",
        duration:2000
      })
      return
    }

    if(!this.wxValidate.checkForm(e.detail.value)){ //表单验证部分有问题
      const error=this.wxValidate.errorList[0]
      console.log(error)
      wx.showToast({
        title: `${error.msg}`,
        icon:'none',
        duration:2000
      })
      return false
    }

    if((this.data.voteRecord.isNeedImg)&&(this.data.candidateRecord.picture.length==0)){
      wx.showToast({
        title:"请上传参赛图片！",
        icon:"none",
        duration:2000
      })
      return
    }

    if((this.data.voteRecord.isNeedVideo)&&(!this.data.tempVideoPath)){
      wx.showToast({
        title:"请上传参赛视频！",
        icon:"none",
        duration:2000
      })
      return
    }

    this.uploadStorage()  
    // this.uploadDatabase()
  },

  uploadStorage(){
    let promiseArr=[]
    var that=this
    //验证成功
    wx.showLoading({
      title: '正在上传',
    })

    //获取当前时间戳，作为名字成分
    var timeStamp =""

    //上传头像
    promiseArr.push(new Promise((reslove, reject) => {
      timeStamp = (new Date()).valueOf()
      wx.cloud.uploadFile({
        cloudPath: 'candidateAvatars/'+app.globalData.openid+timeStamp+'.jpg',
        filePath: that.data.candidateRecord.candidateAvatar, 
      })
      .then(res => {
        //封面图地址为云存储中的地址
        that.setData({
          ['candidateRecord.candidateAvatar']:res.fileID,
          
        })
        reslove()
      })
      .catch(res => {
          console.log("失败",res)
      })
    }))

    
    //上传图片至云存储
    
    var length=this.data.imgArr.length
    var tempImages=[]
    for(var i=0;i<length;i++){
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
        cloudPath: 'candidatePics/'+app.globalData.openid+i+timeStamp+'.png',
        filePath: that.data.imgArr[i]
        })
        .then(res => {
            //封面图地址为云存储中的地址
          if(i==0){
            tempImages=res.fileID
          }
          else{
            tempImages=tempImages.concat(res.fileID)
          }
          that.setData({
            // [`candidateRecord.picture[${i}]`]:res.fileID
            ['candidateRecord.picture']:tempImages
            
          }) 
          reslove()
          // console.log(that.data.candidateRecord)
        })
        .catch(res => {
          console.log("失败",res)
        }) 
      }))
    } 
     
   

    //上传视频至云存储
   
    if(this.data.tempVideoPath){
      timeStamp =(new Date()).valueOf() 
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'candidateVideos/'+app.globalData.openid+timeStamp+'.mp4',
          filePath: that.data.tempVideoPath, // 文件路径
        })
        .then(res => {
          that.setData({
            ['candidateRecord.video']:res.fileID,
            
          })
          reslove()
          console.log("有无",that.data.candidateRecord.video)
        })
        .catch(console.error)
      }))
    }
    Promise.all(promiseArr).then(res => {//等数组都做完后做then方法
      that.uploadDatabase()
     })
    // setTimeout(this.uploadDatabase,1000)
    // if(callback)
    //   callback();// 执行调用函数
  },

  uploadDatabase(){
    let that=this
    //上传报名信息至数据库
    // while(that.data.uploadFlag!=3){
    // }
    wx.cloud.database().collection('candidate').add({
      data:{
        candidateRecord:that.data.candidateRecord,
        voteID:that.data.voteID
      }
    })
    .then(res=>{
      console.log("报名信息上传成功！")
      //发布完成
      wx.hideLoading( )
      wx.showToast({
        title:'报名成功！',
        duration:2000
      })
      //跳转到投票详情页
      wx.navigateTo({
        url: '/pages/voteselectshare/voteselectshare?voteID='+that.data.voteID
      })
    })
    .catch(res=>{
      console.log("报名信息上传失败")
      //发布失败
      wx.hideLoading( )
      wx.showToast({
      title:'报名失败！',
      icon:'none',
      duration:2000
      })
    })
  }
  
 
})