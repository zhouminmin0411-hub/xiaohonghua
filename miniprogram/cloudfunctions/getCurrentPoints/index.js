// 云函数：getCurrentPoints - 获取当前积分
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

function getLocalDayOfWeek(date) {
  const day = date.getDay() // 0=周日
  return day === 0 ? 7 : day // 1=周一 ... 7=周日
}

function parseTimeString(timeStr) {
  if (!timeStr) return null
  const parts = String(timeStr).split(':')
  if (parts.length < 2) return null
  const hour = Number(parts[0])
  const minute = Number(parts[1])
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return { hour, minute }
}

async function tryDistributeWeeklyPoints(childId) {
  const { data: configs } = await db.collection('weekly_config')
    .where({ child_id: childId, enabled: true })
    .limit(1)
    .get()

  if (!configs || configs.length === 0) {
    return null
  }

  const config = configs[0]
  const now = new Date()
  const currentDay = getLocalDayOfWeek(now)
  const configDay = Number(config.day_of_week)

  if (!configDay || configDay !== currentDay) {
    return null
  }

  const timeInfo = parseTimeString(config.time)
  if (!timeInfo) {
    return null
  }

  const scheduledAt = new Date(now)
  scheduledAt.setHours(timeInfo.hour, timeInfo.minute, 0, 0)
  if (now < scheduledAt) {
    return null
  }

  if (config.last_sent_at) {
    const lastSentAt = new Date(config.last_sent_at)
    const sameDay = lastSentAt.getFullYear() === now.getFullYear() &&
      lastSentAt.getMonth() === now.getMonth() &&
      lastSentAt.getDate() === now.getDate()
    if (sameDay) {
      return null
    }
  }

  const weeklyAmount = Number(config.weekly_amount) || 0
  if (weeklyAmount <= 0) {
    return null
  }

  // 获取当前积分
  const { data: pointHistory } = await db.collection('point_history')
    .where({
      child_id: childId
    })
    .orderBy('created_at', 'desc')
    .limit(1)
    .get()

  const currentBalance = pointHistory.length > 0 ? pointHistory[0].balance : 0
  const newBalance = currentBalance + weeklyAmount

  await db.collection('point_history').add({
    data: {
      child_id: childId,
      change: weeklyAmount,
      balance: newBalance,
      reason: '每周固定发放',
      source_type: 'weekly',
      source_id: null,
      created_at: db.serverDate()
    }
  })

  await db.collection('weekly_config').doc(config._id).update({
    data: {
      last_sent_at: db.serverDate()
    }
  })

  return newBalance
}

exports.main = async (event, context) => {
  const { childId } = event
  
  try {
    const distributedBalance = await tryDistributeWeeklyPoints(childId)
    if (distributedBalance !== null) {
      return {
        code: 200,
        message: '操作成功',
        data: {
          points: distributedBalance
        }
      }
    }

    // 获取最新的积分记录
    const { data: pointHistory } = await db.collection('point_history')
      .where({
        child_id: childId
      })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()
    
    const points = pointHistory.length > 0 ? pointHistory[0].balance : 0
    
    return {
      code: 200,
      message: '操作成功',
      data: {
        points: points
      }
    }
  } catch (error) {
    console.error('获取积分失败', error)
    return {
      code: 500,
      message: '获取积分失败',
      error: error.message
    }
  }
}
