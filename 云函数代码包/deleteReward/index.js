// 云函数：deleteReward - 删除奖品
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { rewardId } = event
  
  try {
    // 软删除：设置 is_active 为 false
    await db.collection('rewards').doc(rewardId).update({
      data: {
        is_active: false,
        updated_at: db.serverDate()
      }
    })
    
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  } catch (error) {
    console.error('删除奖品失败', error)
    return {
      code: 500,
      message: '删除奖品失败',
      error: error.message
    }
  }
}

