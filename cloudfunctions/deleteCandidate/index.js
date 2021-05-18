// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})


// 云函数入口函数
exports.main = async (event, context) => {
  var toBeDeleted=[]//待删除的列表
  var voteID=event.voteID
  var openid=event.openid
  var candidateRecord=[]
  var deleteResult=0
  console.log("传过来的两个信息",voteID,openid)
  var promiseArr=[]
   //删除涉及的数据库表：candidate/voteSelectInfo
   //先删除云存储中的头像、图片、视频
  await cloud.database().collection('candidate')
    .where({
      voteID:voteID,
      _openid:openid
    })
    .get()
    .then(res=>{
      console.log("候选人信息",res)
      if(res.data.length!=0)
        {candidateRecord=res.data[0].candidateRecord}
    })
    .catch(res=>{
      console.log("候选人信息获取失败")
    })
    //生成待删除列表-1 头像
    if(candidateRecord.candidateAvatar){
      toBeDeleted[0]=candidateRecord.candidateAvatar
    }
    //生成待删除列表-1 图片
    if(candidateRecord.picture){
      toBeDeleted=toBeDeleted.concat(candidateRecord.picture)
    }
    //生成待删除列表-1 视频
    if(candidateRecord.video){
      toBeDeleted.push(candidateRecord.video)
    }


  await cloud.deleteFile({
      fileList: toBeDeleted
    }).then(res => {
      console.log("删除成功",res.fileList)
    }).catch(error => {
      console.log("删除失败",error)
    })

   //现在删除数据库表-candidate
  await  cloud.database().collection('candidate')
      .where({
        voteID:voteID,
        _openid:openid
      })
        .remove()
        .then(res=>{
          console.log("candidate表删除成功")     
          deleteResult=deleteResult+1
        })
        .catch(console.error)

  //现在删除数据库表-voteSelectInfo
  await  cloud.database().collection('voteSelectInfo')
    .where({
      voteID:voteID,
      voterID:openid
    })
    .remove()
    .then(res=>{
      console.log("voteSelectInfo表删除成功")
      deleteResult=deleteResult+1
    })
    .catch(console.error)

    return deleteResult
}