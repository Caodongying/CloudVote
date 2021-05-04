//index.js
const app = getApp()
let searchKey = '' //搜索词

Page({
  data: {
    picForSwiper:[
      {picUrl:'/images/swiperPics-index/1.jpg'},
      {picUrl:'/images/swiperPics-index/2.png'},
      {picUrl:'/images/swiperPics-index/3.jpg'}
    ],
    userInfo:null
  },

  onShow() {
    searchKey = '' //每次返回首页时，清空搜索词
  },

  //搜索投票项

  //Step1-获取用户输入的搜索词
  getSearchKey(e) {
    searchKey = e.detail.value
  },
  //Step2-搜索点击事件
  goSearch() {
    wx.navigateTo({
      url: this.checkFoodPage() + '?searchKey=' + searchKey,
    })
  },

  //点击文字投票
  voteText(){
    //请求获取权限
    if(!app.globalData.userInfo){
      wx.getUserProfile({
        desc: "获取你的昵称、头像、地区及性别",
        success: (res) => {
          let user = res.userInfo
          this.setData({
            userInfo: user,
          })
          
          //这句之后要注释掉，仅仅为了测试
          wx.setStorageSync('userInfo',this.data.userInfo)

          app.globalData.userInfo=this.data.userInfo
          //console.log(app.globalData.userInfo)
          wx.navigateTo({
            url: '/pages/votetext/votetext',
          });

        },
        fail: res => {
          console.log("获取用户信息失败", res)
        }
      })
    }

    
  },

  //点击图片投票
  votePic(){
    wx.navigateTo({
      url: '/pages/votepic/votepic',
    });
  },

  //点击视频投票
  voteVedio(){
    wx.navigateTo({
      url: '/pages/votevideo/votevideo',
    });
  },

  //点击评选投票
  voteMulti(){
    wx.navigateTo({
      url: '/pages/votemuti/votemulti',
    });
  },


  
})
