// 云函数：updateTask - 更新任务
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
  const { taskId, type, icon, title, description, reward, time_estimate } = event
  
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

    const updateData = {}
    if (type !== undefined) updateData.type = type
    if (icon !== undefined) updateData.icon = icon
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (reward !== undefined) updateData.reward = reward
    if (time_estimate !== undefined) updateData.time_estimate = time_estimate
    updateData.updated_at = db.serverDate()
    
    await db.collection('tasks').doc(taskId).update({
      data: updateData
    })
    
    const { data: updatedTask } = await db.collection('tasks').doc(taskId).get()
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedTask
    }
  } catch (error) {
    console.error('更新任务失败', error)
    return {
      code: 500,
      message: '更新任务失败',
      error: error.message
    }
  }
}
