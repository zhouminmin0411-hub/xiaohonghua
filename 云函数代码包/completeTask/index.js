// 云函数：completeTask - 完成任务
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { recordId } = event
  
  try {
    // 获取任务记录
    const { data: record } = await db.collection('task_records').doc(recordId).get()
    
    if (!record) {
      return { code: 404, message: '任务记录不存在' }
    }
    
    // 获取任务信息
    const { data: task } = await db.collection('tasks').doc(record.task_id).get()
    
    if (!task) {
      return { code: 404, message: '任务不存在' }
    }
    
    // 更新任务记录状态
    await db.collection('task_records').doc(recordId).update({
      data: {
        status: 'completed',
        completed_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    
    // 获取当前积分
    const { data: pointHistory } = await db.collection('point_history')
      .where({
        child_id: record.child_id
      })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const currentBalance = pointHistory.length > 0 ? pointHistory[0].balance : 0
    const reward = task.reward || 0
    const newBalance = currentBalance + reward
    
    // 添加积分历史记录
    await db.collection('point_history').add({
      data: {
        child_id: record.child_id,
        change: reward,
        balance: newBalance,
        reason: `完成任务: ${task.title}`,
        source_type: 'task',
        source_id: task._id,
        created_at: db.serverDate()
      }
    })
    
    return {
      code: 200,
      message: '完成任务成功',
      data: {
        record_id: recordId,
        reward: reward,
        new_balance: newBalance
      }
    }
    
  } catch (error) {
    console.error('完成任务失败', error)
    return {
      code: 500,
      message: '完成任务失败',
      error: error.message
    }
  }
}

