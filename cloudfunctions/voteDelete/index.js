// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  //文字投票删除
  if(event.voteType=='text'){
    var deleteResult=" " //1为第一个删除成功，2为第二个删除成功，3为不成功

    //删除投票发布表
    await cloud.database().collection('voteText')
    .doc(event.voteID)
    .remove()
    .then(res=>{ //一直执行的这个
      console.log("删除成功")
      deleteResult=1
      //删除投票信息表
    })
    .catch(res=>{
      console.log("删除失败")
      deleteResult=3
    })

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
    var deleteResult=" " 
    await cloud.database().collection('voteSelect')
    .doc(event.voteID)
    .remove()
    .then(res=>{ //一直执行的这个
      console.log("删除成功")
      deleteResult="deleteSuccess"
    })
    .catch(res=>{
      console.log("删除失败")
      deleteResult="deleteFail"
    }
    )
    return{
      deleteResult:deleteResult
    }
  }

  
}