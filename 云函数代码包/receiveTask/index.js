// 云函数：receiveTask - 领取任务
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId, taskId } = event
  
  try {
    // 检查任务是否存在
    const { data: tasks } = await db.collection('tasks').doc(taskId).get()
    if (!tasks) {
      return { code: 404, message: '任务不存在' }
    }
    
    // 创建任务记录
    const result = await db.collection('task_records').add({
      data: {
        child_id: childId,
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

