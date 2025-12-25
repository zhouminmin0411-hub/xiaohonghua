// 云函数：adjustPoints - 调整积分（家长端）
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

async function getCurrentUser() {
  const { OPENID } = cloud.getWXContext()
  const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  return data && data.length > 0 ? data[0] : null
}

exports.main = async (event, context) => {
  const { childId, change, reason } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const effectiveChildId = user._id
    if (childId && childId !== effectiveChildId) {
      return { code: 403, message: '无权调整该用户积分' }
    }

    // 获取当前积分
    const { data: pointHistory } = await db.collection('point_history')
      .where({ child_id: effectiveChildId })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const currentBalance = pointHistory.length > 0 ? pointHistory[0].balance : 0
    const newBalance = currentBalance + change
    
    // 添加积分历史记录
    await db.collection('point_history').add({
      data: {
        child_id: effectiveChildId,
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
