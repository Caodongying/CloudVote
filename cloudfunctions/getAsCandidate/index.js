// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  var voteSelect=[]
  await cloud.database().collection('candidate')
        .aggregate()
        .match({
          _openid:event.voterID
        })
        .lookup({
          from:'voteSelect',
          localField:'voteID',
          foreignField:'_id',
          as:'voteInfo'
        })
         .project({
          voteID:1,
          ['voteInfo.voteRecord.title']:1,
          ['voteInfo.voteRecord.cover']:1
        })
        .end()
        .then(res=>{
          console.log("云函数的openid",event.voterID)
            console.log("云函数调用结果",res)
            voteSelect=res.data
        })
        .catch(err => console.error(err))
  return voteSelect
}