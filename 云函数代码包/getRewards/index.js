// 云函数：getRewards - 获取奖品列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { data: rewards } = await db.collection('rewards')
      .where({
        is_active: true
      })
      .orderBy('cost', 'asc')
      .get()
    
    return {
      code: 200,
      message: '操作成功',
      data: rewards
    }
  } catch (error) {
    console.error('获取奖品失败', error)
    return {
      code: 500,
      message: '获取奖品失败',
      error: error.message
    }
  }
}

