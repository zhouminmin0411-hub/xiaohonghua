// 云函数：getCurrentPoints - 获取当前积分
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

async function getCurrentUser() {
  const { OPENID } = cloud.getWXContext()
  const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  return data && data.length > 0 ? data[0] : null
}

function getLocalDayOfWeek(date) {
  const day = date.getDay() // 0=周日
  return day === 0 ? 7 : day // 1=周一 ... 7=周日
}

function getWeekStart(date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // 周一为本周起点
  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getWeekEnd(weekStart) {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 7)
  end.setHours(0, 0, 0, 0)
  return end
}

function isWithinWeek(dateValue, weekStart, weekEnd) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  return date >= weekStart && date < weekEnd
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

async function hasWeeklyHistory(childId, weekStart, weekEnd) {
  const { data } = await db.collection('point_history')
    .where({
      child_id: childId,
      source_type: 'weekly',
      created_at: _.gte(weekStart).and(_.lt(weekEnd))
    })
    .limit(1)
    .get()

  return data && data.length > 0
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

  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(weekStart)
  if (isWithinWeek(config.last_sent_at, weekStart, weekEnd)) {
    return null
  }

  if (await hasWeeklyHistory(childId, weekStart, weekEnd)) {
    return null
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
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const effectiveChildId = user._id
    if (childId && childId !== effectiveChildId) {
      return { code: 403, message: '无权访问积分' }
    }

    const distributedBalance = await tryDistributeWeeklyPoints(effectiveChildId)
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
        child_id: effectiveChildId
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
