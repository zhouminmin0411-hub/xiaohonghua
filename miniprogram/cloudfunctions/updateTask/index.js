// 云函数：updateTask - 更新任务
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { taskId, type, icon, title, description, reward, time_estimate } = event
  
  try {
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
    
    const { data: task } = await db.collection('tasks').doc(taskId).get()
    
    return {
      code: 200,
      message: '更新成功',
      data: task
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

