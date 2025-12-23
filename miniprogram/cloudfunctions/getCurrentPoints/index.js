// 云函数：getCurrentPoints - 获取当前积分
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId } = event
  
  try {
    // 获取最新的积分记录
    const { data: pointHistory } = await db.collection('point_history')
      .where({
        child_id: childId
      })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const points = pointHistory.length > 0 ? pointHistory[0].balance : 0
    
    return {
      code: 200,
      message: '操作成功',
      data: {
        points: points
      }
    }
  } catch (error) {
    console.error('获取积分失败', error)
    return {
      code: 500,
      message: '获取积分失败',
      error: error.message
    }
  }
}

