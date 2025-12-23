// 云函数：adjustPoints - 调整积分（家长端）
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId, change, reason } = event
  
  try {
    // 获取当前积分
    const { data: pointHistory } = await db.collection('point_history')
      .where({ child_id: childId })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const currentBalance = pointHistory.length > 0 ? pointHistory[0].balance : 0
    const newBalance = currentBalance + change
    
    // 添加积分历史记录
    await db.collection('point_history').add({
      data: {
        child_id: childId,
        change: change,
        balance: newBalance,
        reason: reason || '手动调整',
        source_type: 'manual',
        source_id: null,
        created_at: db.serverDate()
      }
    })
    
    return {
      code: 200,
      message: '调整成功',
      data: {
        change: change,
        new_balance: newBalance
      }
    }
  } catch (error) {
    console.error('调整积分失败', error)
    return {
      code: 500,
      message: '调整积分失败',
      error: error.message
    }
  }
}

