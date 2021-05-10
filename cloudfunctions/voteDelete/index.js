// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  //文字投票删除
  if(event.voteType=='text'){
    var deleteResult=" " 
    await cloud.database().collection('voteText')
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

  //评选投票删除
}