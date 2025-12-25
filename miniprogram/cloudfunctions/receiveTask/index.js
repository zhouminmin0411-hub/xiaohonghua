// 云函数：receiveTask - 领取任务
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
  const { childId, taskId } = event
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const effectiveChildId = user._id
    if (childId && childId !== effectiveChildId) {
      return { code: 403, message: '无权操作该任务' }
    }

    // 检查任务是否存在
    const { data: task } = await db.collection('tasks').doc(taskId).get()
    if (!task || task.is_active === false) {
      return { code: 404, message: '任务不存在' }
    }
    if (task.created_by_parent_id !== effectiveChildId) {
      return { code: 403, message: '无权操作该任务' }
    }
    
    // 创建任务记录
    const result = await db.collection('task_records').add({
      data: {
        child_id: effectiveChildId,
        task_id: taskId,
        status: 'in_progress',
        received_at: db.serverDate(),
        completed_at: null,
        parent_liked: false,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    
    // 获取创建的记录
    const { data: record } = await db.collection('task_records').doc(result._id).get()
    
    return {
      code: 200,
      message: '领取成功',
      data: record
    }
  } catch (error) {
    console.error('领取任务失败', error)
    return {
      code: 500,
      message: '领取任务失败',
      error: error.message
    }
  }
}
