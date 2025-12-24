// 云函数：getWeeklyConfig - 获取每周发放配置
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const DEFAULT_CONFIG = {
  weeklyAmount: 10,
  dayOfWeek: 1,
  time: '09:00',
  enabled: false,
  lastSentAt: null
}

exports.main = async (event, context) => {
  const { childId } = event || {}

  if (!childId) {
    return { code: 400, message: '缺少 childId' }
  }

  try {
    const { data } = await db.collection('weekly_config')
      .where({ child_id: childId })
      .limit(1)
      .get()

    const config = data && data.length > 0 ? data[0] : null

    if (!config) {
      // 未配置则返回默认值
      return {
        code: 200,
        message: '操作成功',
        data: { ...DEFAULT_CONFIG }
      }
    }

    return {
      code: 200,
      message: '操作成功',
      data: {
        weeklyAmount: config.weekly_amount ?? DEFAULT_CONFIG.weeklyAmount,
        dayOfWeek: config.day_of_week ?? DEFAULT_CONFIG.dayOfWeek,
        time: config.time ?? DEFAULT_CONFIG.time,
        enabled: config.enabled ?? DEFAULT_CONFIG.enabled,
        lastSentAt: config.last_sent_at ?? null
      }
    }
  } catch (error) {
    // 集合不存在时，自动创建并返回默认配置
    if (error && error.errCode === -502005) {
      try {
        await db.createCollection('weekly_config')
        return {
          code: 200,
          message: '已创建 weekly_config 集合，返回默认配置',
          data: { ...DEFAULT_CONFIG }
        }
      } catch (e) {
        console.error('创建集合失败', e)
      }
    }

    console.error('获取每周配置失败', error)
    return {
      code: 500,
      message: '获取配置失败',
      error: error.message
    }
  }
}
