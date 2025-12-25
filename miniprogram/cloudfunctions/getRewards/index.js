// 云函数：getRewards - 获取奖品列表
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
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const { data: rewards } = await db.collection('rewards')
      .where({
        is_active: true,
        created_by_parent_id: user._id
      })
      .orderBy('cost', 'asc')
      .get()
    
    return {
      code: 200,
      message: '操作成功',
      data: rewards
    }
  } catch (error) {
    console.error('获取奖品失败', error)
    return {
      code: 500,
      message: '获取奖品失败',
      error: error.message
    }
  }
}
