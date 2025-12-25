// 云函数：weeklyPointsCron - 每分钟检查并发放每周积分
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

const TZ_OFFSET_MINUTES = 480 // Asia/Shanghai

function getLocalNow() {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + TZ_OFFSET_MINUTES * 60000)
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

function getScheduledAt(now, configDay, timeInfo) {
  if (!configDay || !timeInfo) return null
  const weekStart = getWeekStart(now)
  const scheduled = new Date(weekStart)
  scheduled.setDate(weekStart.getDate() + (configDay - 1))
  scheduled.setHours(timeInfo.hour, timeInfo.minute, 0, 0)
  return scheduled
}

function hasSentForSchedule(lastSentAt, scheduledAt) {
  if (!lastSentAt || !scheduledAt) return false
  const last = new Date(lastSentAt)
  if (Number.isNaN(last.getTime())) return false
  return last.getTime() >= scheduledAt.getTime()
}

async function listEnabledConfigs() {
  const limit = 100
  let offset = 0
  const configs = []

  while (true) {
    const { data } = await db.collection('weekly_config')
      .where({ enabled: _.in([true, 1]) })
      .skip(offset)
      .limit(limit)
      .get()

    if (!data || data.length === 0) {
      break
    }

    configs.push(...data)
    if (data.length < limit) {
      break
    }
    offset += data.length
  }

  return configs
}

async function getCurrentBalance(childId) {
  const { data: pointHistory } = await db.collection('point_history')
    .where({ child_id: childId })
    .orderBy('created_at', 'desc')
    .limit(1)
    .get()

  return pointHistory.length > 0 ? pointHistory[0].balance : 0
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

async function distributeWeeklyPoints(config, scheduledAt) {
  const childId = config.child_id
  const weeklyAmount = Number(config.weekly_amount) || 0

  if (!childId || weeklyAmount <= 0) {
    return false
  }

  const currentBalance = await getCurrentBalance(childId)
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

  return true
}

exports.main = async () => {
  const now = getLocalNow()
  const currentDay = getLocalDayOfWeek(now)
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(weekStart)
  const configs = await listEnabledConfigs()

  const issued = []

  for (const config of configs) {
    const configDay = Number(config.day_of_week)
    if (!configDay || configDay !== currentDay) {
      continue
    }

    const timeInfo = parseTimeString(config.time)
    const scheduledAt = getScheduledAt(now, configDay, timeInfo)
    if (!scheduledAt || now < scheduledAt) {
      continue
    }

    if (hasSentForSchedule(config.last_sent_at, scheduledAt)) {
      continue
    }

    if (isWithinWeek(config.last_sent_at, weekStart, weekEnd)) {
      continue
    }

    if (await hasWeeklyHistory(config.child_id, weekStart, weekEnd)) {
      continue
    }

    const ok = await distributeWeeklyPoints(config, scheduledAt)
    if (ok) {
      issued.push({
        childId: config.child_id,
        amount: Number(config.weekly_amount) || 0
      })
    }
  }

  return {
    code: 200,
    message: '处理完成',
    data: {
      issuedCount: issued.length,
      issued
    }
  }
}
