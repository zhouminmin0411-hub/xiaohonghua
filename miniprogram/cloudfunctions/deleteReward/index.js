// 云函数：deleteReward - 删除奖品
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
  const { rewardId } = event
  
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
