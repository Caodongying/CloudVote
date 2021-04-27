// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
   cloud.database().collection('voteText').add({
    data:{
      voteRecord:event.voteRecord
    },
    success:res=>{
      event=res
    }
   })

   console.log(event)
   return event
}