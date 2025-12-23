// 云函数：deleteTask - 删除任务
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { taskId } = event
  
  try {
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

