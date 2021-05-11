// pages/aftervotetemplate/aftervotetemplate.js
const app=getApp()

Page({
  data:{
    voteID:0,
    voteRecord:" "
  },  

  onLoad(options) {
    this.setData({
      voteID:options.voteID
    })
    this.getVoteRecord()
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

  //编辑-只有在报名开始前才能修改
  voteEdit(){
    var canEdit=false
    let enrollDate=this.data.voteRecord.dateBegin1 //报名开始日期
    let enrollTime=this.data.voteRecord.timeBegin1 //报名开始时间
    let voteDate=this.data.voteRecord.dateBegin//投票开始时间
    let voteTime=this.data.voteRecord.timeBegin //投票开始时间
    let currentDate=app.getCurrentDate()
    let currentTime=app.getCurrentTime()
    var date1=""
    var date2 = new Date(currentDate)
    if(this.data.voteRecord.isEnroll){ //开放报名
      date1 = new Date(enrollDate)
      if(date2<date1){ //现在还没有到报名开始那天
        canEdit=true
      }
      else if(date2==date1){//已经到了报名那天
        if(currentTime<enrollTime){//时间还没到
          canEdit=true
        }
      }
    }
    else{ //不开放报名
      date1 = new Date(voteDate)
      if(date2<date1){ //现在还没有到投票开始那天
        canEdit=true
      }
      else if(date2==date1){//已经到了报名那天
        if(currentTime<voteTime){//时间还没到
          canEdit=true
        }
      }

    }

    if(canEdit==true){ //可以编辑
      wx.navigateTo({
        url: '/pages/votetemplate/votetemplate?voteID='+this.data.voteID+"&submitType="+2
      })
    }
    else{ //不可以编辑
      if(this.data.voteRecord.isEnroll){
        wx.showToast({
          title:'报名已经开始，不可以编辑',
          icon:'none',
          duration:2000
        })
      }
      else{
        wx.showToast({
          title:'投票已经开始，不可以编辑',
          icon:'none',
          duration:2000
        })
      }
    }
  },

  voteDelete(){
    let that=this
    wx.showModal({
      content: '确定要删除本条投票吗？',
      cancelText:'取消',
      confirmText:'确定',
      success (res) {
        if (res.confirm) { //确定删除
          console.log('确定执行删除操作')
          wx.cloud.callFunction({
            name:'voteDelete',
            data:{
              voteID:that.data.voteID,
              voteType:'selectTemplate' //投票类型为评选模板投票
            }
          })
          .then(res=>{
            console.log("云函数调用成功")
            console.log(res)
            var deleteResult=res.result.deleteResult
            //删除成功
            if(deleteResult=="deleteSuccess"){
              //弹窗未显示
              wx.showToast({
                title:'删除成功！',
                duration:2000
              })
             
              //跳转到主界面
              setTimeout(function(){
                wx.switchTab({
                  url: '/pages/index/index'
                })}
                ,1000)
            }
            //删除失败
            else {
              wx.showToast({
                title:'删除失败！',
                icon:'none',
                duration:2000
              })
            }

          })
          .catch(console.error)
          }
        //不可以在这里用then和catch判断是否删除成功，因为这里判断的是云函数是否调用成功
         else if (res.cancel) { //取消删除
          console.log('删除操作取消')
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '评选投票',
      path: '/pages/voteselectshare/voteselectshare?voteID='+this.data.voteID,//这里的path是当前页面的path，必须是以 / 开头的完整路径，后面拼接的参数 是分享页面需要的参数  不然分享出去的页面可能会没有内容
      imageUrl: this.data.voteRecord.cover
      // desc: '描述'
    }
  },

  candidateManage(){
    wx.navigateTo({
      url:'/pages/candidateManage/candidateManage?voteID='+this.data.voteID
    })
  }
})