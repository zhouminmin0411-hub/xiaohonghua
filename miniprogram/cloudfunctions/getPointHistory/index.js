// 云函数：getPointHistory - 获取积分历史
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId } = event
  
  try {
    const { data: history } = await db.collection('point_history')
      .where({
        child_id: childId
      })
      .orderBy('created_at', 'desc')
      .limit(100)
      .get()
    
    return {
      code: 200,
      message: '操作成功',
      data: history
    }
  } catch (error) {
    console.error('获取积分历史失败', error)
    return {
      code: 500,
      message: '获取积分历史失败',
      error: error.message
    }
  }
}

