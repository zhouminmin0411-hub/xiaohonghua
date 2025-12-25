// 云函数：createTask - 创建任务（家长端）
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
  const { type, icon, title, description, reward, time_estimate } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const result = await db.collection('tasks').add({
      data: {
        type: type || 'daily',
        icon: icon || '📝',
        title: title,
        description: description || '',
        reward: reward || 0,
        time_estimate: time_estimate || '',
        created_by_parent_id: user._id,
        is_active: true,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    
    const { data: task } = await db.collection('tasks').doc(result._id).get()
    
    return {
      code: 200,
      message: '创建成功',
      data: task
    }
  } catch (error) {
    console.error('创建任务失败', error)
    return {
      code: 500,
      message: '创建任务失败',
      error: error.message
    }
  }
}
