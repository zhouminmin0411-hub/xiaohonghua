// 云函数：getTaskRecords - 获取任务记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId, status } = event
  
  try {
    let query = db.collection('task_records').where({ child_id: childId })
    
    if (status) {
      query = query.where({ status: status })
    }
    
    const { data: records } = await query
      .orderBy('created_at', 'desc')
      .get()
    
    return {
      code: 200,
      message: '操作成功',
      data: records
    }
  } catch (error) {
    console.error('获取任务记录失败', error)
    return {
      code: 500,
      message: '获取任务记录失败',
      error: error.message
    }
  }
}

