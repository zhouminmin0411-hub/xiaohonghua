// 云函数：getTaskRecords - 获取任务记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { childId, status } = event

  try {
    const result = await db.collection('task_records').aggregate()
      .match({
        child_id: childId,
        ...(status ? { status } : {})
      })
      .lookup({
        from: 'tasks',
        localField: 'task_id',
        foreignField: '_id',
        as: 'task_info'
      })
      .unwind('$task_info')
      .project({
        _id: 1,
        id: '$_id',
        status: 1,
        completedAt: '$completed_at',
        receivedAt: '$received_at',
        createdAt: '$created_at',
        parentLikedAt: '$parent_liked_at',
        parentLiked: '$parent_liked', // 兼容旧字段
        taskTitle: '$task_info.title',
        taskIcon: '$task_info.icon',
        reward: '$task_info.reward'
      })
      .sort({
        completedAt: -1,
        createdAt: -1
      })
      .end()

    return {
      code: 200,
      message: '操作成功',
      data: result.list
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

