// 云函数：createReward - 创建奖品
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
  const { icon, title, description, cost, stock } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const result = await db.collection('rewards').add({
      data: {
        icon: icon || '🎁',
        title: title,
        description: description || '',
        cost: cost || 0,
        stock: stock || null,
        created_by_parent_id: user._id,
        is_active: true,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    
    const { data: reward } = await db.collection('rewards').doc(result._id).get()
    
    return {
      code: 200,
      message: '创建成功',
      data: reward
    }
  } catch (error) {
    console.error('创建奖品失败', error)
    return {
      code: 500,
      message: '创建奖品失败',
      error: error.message
    }
  }
}
