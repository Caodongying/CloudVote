// pages/candidateManage/candidateManage.js
Page({
  data: {
    candidateInfo:[],
    voteID:0
  },

  onLoad(options){
    this.setData({
      voteID:options.voteID
    })
    console.log("选手管理界面的voteid",this.data.voteID)
    this.getCandidate()
  },

  getCandidate(){
    let that=this
    const db=wx.cloud.database()
    db.collection('candidate')
    .where({
      voteID:that.data.voteID,
    })
    .get()
    .then(res=>{
      that.setData({
        candidateInfo:res.data
      })
    })
    .catch(err => console.error(err))
  },

  delete(e){
    let that=this
    var index=e.currentTarget.dataset.index
    var deleteResult=""
    console.log("这里的openid",that.data.candidateInfo[index]._openid)
    wx.showModal({
      content: '确定要删除本候选人吗？',
      cancelText:'取消',
      confirmText:'确定',
      success (res) {
        if (res.confirm) { //确定删除
          wx.showLoading({
            title: '正在删除',
          })
          wx.cloud.callFunction({
            name:'deleteCandidate',
            data:{
              voteID:that.data.voteID,
              openid:that.data.candidateInfo[index]._openid 
            }
          })
          .then(res=>{
            deleteResult=res.result.deleteResult
            // console.log("删除结果",res.result.deleteResult)
            // if(deleteResult==2){
              wx.hideLoading()
              wx.showToast({
                title:'删除成功！',
                duration:1000
              })
              that.getCandidate()
            // }
            // else{
            //   wx.hideLoading()
            //   wx.showToast({
            //     title:'删除失败！',
            //     duration:2000,
            //     icon:"none"
            //   })
            // }
          })
          .catch(console.error)
        }
         else if (res.cancel) { //取消删除
          console.log('删除操作取消')
        }
      }
    })
  }
})