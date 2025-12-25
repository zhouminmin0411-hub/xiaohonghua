// 云函数：getPointHistory - 获取积分历史
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
  const { childId } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const effectiveChildId = user._id
    if (childId && childId !== effectiveChildId) {
      return { code: 403, message: '无权访问积分历史' }
    }

    const { data: history } = await db.collection('point_history')
      .where({
        child_id: effectiveChildId
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
