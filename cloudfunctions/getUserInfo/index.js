// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  var userInfo=" "
  console.log("voteid",event.voteID)
 await  cloud.database().collection('voteText').aggregate()
    .match({
      _id:event.voteID
    })
    .lookup({
      from: 'user',
      localField: '_openid',
      foreignField: '_openid',
      as: 'userInfo',
    })  
    .project({
      ['userInfo.userInfo.nickName']:1,
      ['userInfo.userInfo.avatarUrl']:1
    })
    .end()
    .then(res=>{
        userInfo=res.list
    })
    .catch(err => console.error(err))
    return userInfo
}