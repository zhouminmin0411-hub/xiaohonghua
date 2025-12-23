// 云函数：updateReward - 更新奖品
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { rewardId, icon, title, description, cost, stock } = event
  
  try {
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
    
    const { data: reward } = await db.collection('rewards').doc(rewardId).get()
    
    return {
      code: 200,
      message: '更新成功',
      data: reward
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

