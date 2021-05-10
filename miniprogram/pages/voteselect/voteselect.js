// pages/voteselect/voteselect.js
Page({
  data: {
    template:"" //投票模板数据库内容：模板编号（自动生成），封面图templateCover，名称templateTitle
  },

  onLoad(options) {
    this.getVoteTemplate()
  },


  //获取模板
  getVoteTemplate(){
    wx.cloud.database().collection('template')
      .get()
      .then(res=>{
       this.setData({
         template:res.data 
       })
      //  console.log(this.data.template)
      }).catch(res=>{
        console.log("模板获取失败",res)
      })
  },


  //前往投票
  onVote(e){
    // console.log(e)
    var templateID=e.currentTarget.dataset.templateid
    wx.navigateTo({
      url: '/pages/votetemplate/votetemplate?templateID='+templateID+"&submitType="+1
    });
  }

})