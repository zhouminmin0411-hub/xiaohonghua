// 云函数：deleteTask - 删除任务
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
  const { taskId } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const { data: task } = await db.collection('tasks').doc(taskId).get()
    if (!task) {
      return { code: 404, message: '任务不存在' }
    }
    if (task.created_by_parent_id !== user._id) {
      return { code: 403, message: '无权操作该任务' }
    }

    // 软删除：设置 is_active 为 false
    await db.collection('tasks').doc(taskId).update({
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
    console.error('删除任务失败', error)
    return {
      code: 500,
      message: '删除任务失败',
      error: error.message
    }
  }
}
