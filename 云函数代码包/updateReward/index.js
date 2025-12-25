// 云函数：updateReward - 更新奖品
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
  const { rewardId, icon, title, description, cost, stock } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const { data: reward } = await db.collection('rewards').doc(rewardId).get()
    if (!reward) {
      return { code: 404, message: '奖品不存在' }
    }
    if (reward.created_by_parent_id !== user._id) {
      return { code: 403, message: '无权操作该奖品' }
    }

    const updateData = {}
    if (icon !== undefined) updateData.icon = icon
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (cost !== undefined) updateData.cost = cost
    if (stock !== undefined) updateData.stock = stock
    updateData.updated_at = db.serverDate()
    
    await db.collection('rewards').doc(rewardId).update({
      data: updateData
    })
    
    const { data: updatedReward } = await db.collection('rewards').doc(rewardId).get()
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedReward
    }
  } catch (error) {
    console.error('更新奖品失败', error)
    return {
      code: 500,
      message: '更新奖品失败',
      error: error.message
    }
  }
}
