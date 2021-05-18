// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  //文字投票删除
  if(event.voteType=='text'){
    var deleteResult=0 //1为第一个删除成功，2为第二个删除成功，3为不成功

    //删除投票发布表内容
    await cloud.database().collection('voteText')
    .doc(event.voteID)
    .remove()
    .then(res=>{ //一直执行的这个
      console.log("删除成功")
      deleteResult=1
    })
    .catch(res=>{
      console.log("删除失败")
      deleteResult=3
    })

    //删除投票信息表
    await cloud.database().collection('voteTextInfo')
        .where({
          voteID:event.voteID
        })
        .remove()
        .then(res=>{
          deleteResult=2
        })
        .catch(res=>{
          console.log("删除失败")
          deleteResult=3
        })
    
    return{
      deleteResult:deleteResult
    }
  }
  
  //评选投票删除
  else if(event.voteType=='selectTemplate'){
    var deleteResult=0
    var voteID=event.voteID
    var toBeDeleted=[]//待删除的列表
    var candidateRecord=[]

    //3步：删除云存储中所有候选人信息，删除voteSelect表中voteID项，删除voteSelectInfo中含有voteID的项，删除candidate中的项

    //3-1 删除云存储
    await cloud.database().collection('candidate')
    .where({
      voteID:voteID
    })
    .get()
    .then(res=>{
      console.log("候选人信息",res.data)
      if(res.data.length!=0)
        {candidateRecord=res.data}
    })
    .catch(res=>{
      console.log("候选人信息获取失败")
    })

    for(var i=0;i<candidateRecord.length;i++){
      //生成待删除列表-1 头像
      if(candidateRecord[i].candidateAvatar){
        toBeDeleted=toBeDeleted.concat(candidateRecord[i].candidateAvatar)
      }
      //生成待删除列表-1 图片
      if(candidateRecord[i].picture){
        toBeDeleted=toBeDeleted.concat(candidateRecord[i].picture)
      }
      //生成待删除列表-1 视频
      if(candidateRecord[i].video){
        toBeDeleted.push(candidateRecord[i].video)
      }
    }
    
    if(candidateRecord.length!=0){
    await cloud.deleteFile({
        fileList: toBeDeleted
      }).then(res => {
        console.log("云存储删除成功",res.fileList)
        deleteResult=deleteResult+1
      }).catch(error => {
        console.log("云存储删除失败",error)
      })
    }
    else{
      deleteResult=deleteResult+1
    }

    //3-2 删除voteSelect表
    await cloud.database().collection('voteSelect')
    .doc(voteID)
    .remove()
    .then(res=>{ //一直执行的这个
      console.log("voteSelect表删除成功")
      deleteResult=deleteResult+1
    })
    .catch(res=>{
      console.log("voteSelect表删除失败")
    })

    //3-3 删除voteSelectInfo
    await  cloud.database().collection('voteSelectInfo')
    .where({
      voteID:voteID
    })
    .remove()
    .then(res=>{
      console.log("voteSelectInfo表删除成功")
      deleteResult=deleteResult+1
    })
    .catch(console.error)

    //3-4 删除candidate中的项
    await  cloud.database().collection('candidate')
    .where({
      voteID:voteID
    })
    .remove()
    .then(res=>{
      console.log("candidate表删除成功")
      deleteResult=deleteResult+1
    })
    .catch(console.error)

    return{
      deleteResult:deleteResult
    }
  }

  
}