// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'graduation-voteapp-9drdj3462e4b2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  var openid=event.openid
  var voteText=[]
  var voteSelect=[]
  const $ = cloud.database().command.aggregate
  if(event.voteType=='text'){
    await cloud.database().collection('voteTextInfo')
      .aggregate()
      .match({
        _openid:openid
      })
      .lookup({
        from:'voteText',
        // pipeline: $.pipeline()
        // .group({
        //   _id:null,
        //   data: $.first('$$ROOT')
        // })
        // .done(),
        localField:'voteID',
        foreignField:'_id',
        as:'voteInfo'
      })
      .group({
        _id:{
          voteID:'$voteID',
          title:'$voteInfo.voteRecord.title'
        },
      })
      // .project({
      //   voteID:1,
      //   ['voteInfo.voteRecord.title']:1
      // })
      .end()
      .then(res=>{
        console.log("lalaal",res)
          voteText=res.list
      })
      .catch(err => console.error(err))
      return  voteText
  }
  else if(event.voteType=='select'){
    await cloud.database().collection('voteSelectInfo')
      .aggregate()
      .match({
        _openid:openid
      })
      .lookup({
        from:'voteSelect',
        localField:'voteID',
        foreignField:'_id',
        as:'voteInfo'
      })
      .group({
        _id:{
          voteID:'$voteID',
          title:'$voteInfo.voteRecord.title',
          cover:'$voteInfo.voteRecord.cover'
        },
      })
      .end()
      .then(res=>{
        console.log("lalaal",res)
          voteSelect=res.list
      })
      .catch(err => console.error(err))
    return voteSelect
  }
}