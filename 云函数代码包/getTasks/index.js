// 云函数：getTasks - 获取任务列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { data: tasks } = await db.collection('tasks')
      .where({
        is_active: true
      })
      .orderBy('created_at', 'desc')
      .get()
    
    return {
      code: 200,
      message: '操作成功',
      data: tasks
    }
  } catch (error) {
    console.error('获取任务失败', error)
    return {
      code: 500,
      message: '获取任务失败',
      error: error.message
    }
  }
}

