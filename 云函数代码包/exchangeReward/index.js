// 云函数：exchangeReward - 兑换奖品
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { childId, rewardId } = event
  
  try {
    // 获取奖品信息
    const { data: reward } = await db.collection('rewards').doc(rewardId).get()
    
    if (!reward) {
      return { code: 404, message: '奖品不存在' }
    }
    
    // 获取当前积分
    const { data: pointHistory } = await db.collection('point_history')
      .where({ child_id: childId })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const currentBalance = pointHistory.length > 0 ? pointHistory[0].balance : 0
    
    // 检查积分是否足够
    if (currentBalance < reward.cost) {
      return { 
        code: 400, 
        message: '积分不足',
        data: {
          current: currentBalance,
          need: reward.cost
        }
      }
    }
    
    // 扣除积分
    const newBalance = currentBalance - reward.cost
    
    // 创建兑换记录
    const exchangeResult = await db.collection('reward_records').add({
      data: {
        child_id: childId,
        reward_id: rewardId,
        cost: reward.cost,
        status: 'pending',
        exchanged_at: db.serverDate(),
        fulfilled_at: null,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    
    // 添加积分历史记录
    await db.collection('point_history').add({
      data: {
        child_id: childId,
        change: -reward.cost,
        balance: newBalance,
        reason: `兑换奖品: ${reward.title}`,
        source_type: 'reward',
        source_id: rewardId,
        created_at: db.serverDate()
      }
    })
    
    return {
      code: 200,
      message: '兑换成功',
      data: {
        record_id: exchangeResult._id,
        cost: reward.cost,
        new_balance: newBalance
      }
    }
    
  } catch (error) {
    console.error('兑换奖品失败', error)
    return {
      code: 500,
      message: '兑换奖品失败',
      error: error.message
    }
  }
}

