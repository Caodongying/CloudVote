// pages/aftervotetext/aftervotetext.js
const app=getApp()
Page({
  data: {
    voteID:0,
    voteRecord:" ",
    userInfo:""
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
    wx.getUserProfile({
      desc: "为了分享投票，我们需要获取你的昵称、头像，请问是否同意？",
      success: (res) => {
        let user = res.userInfo
        this.setData({
          userInfo: user,
        })
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },

   /**
   * 用户点击右上角分享
   */
    onShareAppMessage() {
      //请求获取权限
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) { //还没授权
            wx.authorize({
              scope: 'scope.userInfo',
              success () {
                wx.getUserProfile({
                  desc: "为了分享投票，我们需要获取你的昵称、头像，请问是否同意？",
                  success: (res) => {
                    let user = res.userInfo
                    this.setData({
                      userInfo: user,
                    })
                  },
                  fail: res => {
                    console.log("获取用户信息失败", res)
                  }
                })
              }
            })
          }
        }
      })

      let that=this  
      return {
        title: '文字投票',
        path: 'pages/votetextshare/votetextshare?voteID=&userInfo='+that.data.voteID+that.data.userInfo,//这里的path是当前页面的path，必须是以 / 开头的完整路径，后面拼接的参数 是分享页面需要的参数  不然分享出去的页面可能会没有内容
        imageUrl: "/images/voteText.png",
        // desc: '描述'
      }
    },

  //排行榜 未完
  rankVote(){
    
  },
  
    //投票具体信息展示
  // voteDetail(){
  //   wx.navigateTo({
  //     url:'/pages/voteTextDetail/voteTextDetail'
  //   })
    
  // }
})