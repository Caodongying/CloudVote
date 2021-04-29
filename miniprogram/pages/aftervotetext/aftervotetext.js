// pages/aftervotetext/aftervotetext.js
Page({
  data: {
    voteID:0,
    voteRecord:" "
  },

 

  onLoad(options){ //获取页面跳转时传递得到的参数
    //console.log("获取的_id为：",options)
    this.setData({
      voteID:options.voteID,
      voteRecord:wx.getStorageSync('voteRecord')
    })
  // var xx=wx.getStorageInfoSync()
  // console.log("存储区",xx)
    
  },

  // getVoteRecord(){
  //   wx.cloud.database().collection('voteText')
  //     .doc(this.data.voteID)
  //     .get()
  //     .then(res=>{
  //       console.log("获取投票信息成功",res)
  //       this.data.voteRecord=res.data.voteRecord
  //       //console.log("当前",this.data.voteRecord.title)
  //     })
  //     .catch(res=>{
  //       console.log("获取投票数据失败")
  //     })
  // },

  //删除当前投票
  deleteVote(){
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
              voteType:'text' //投票类型为文字投票
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

  //分享当前投票
  shareVote(){

  },

   /**
   * 用户点击右上角分享
   */
    onShareAppMessage: function () {

    },


  //投票具体信息展示
  voteDetail(){
    wx.navigateTo({
      url:'/pages/voteTextDetail/voteTextDetail'
    })
    
  }
})