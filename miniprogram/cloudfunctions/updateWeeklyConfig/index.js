// 云函数：updateWeeklyConfig - 更新每周发放配置
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

async function getCurrentUser() {
  const { OPENID } = cloud.getWXContext()
  const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  return data && data.length > 0 ? data[0] : null
}

exports.main = async (event, context) => {
  const { childId, config } = event || {}

  if (!childId || !config) {
    return { code: 400, message: '缺少必要参数' }
  }

  const { weeklyAmount, dayOfWeek, time, enabled } = config

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { code: 401, message: '未登录' }
    }

    const effectiveChildId = user._id
    if (childId !== effectiveChildId) {
      return { code: 403, message: '无权更新该用户配置' }
    }

    const collection = db.collection('weekly_config')
    let data
    try {
      const res = await collection.where({ child_id: effectiveChildId }).limit(1).get()
      data = res.data
    } catch (err) {
      // 集合不存在时自动创建
      if (err && err.errCode === -502005) {
        await db.createCollection('weekly_config')
        data = []
      } else {
        throw err
      }
    }
    const payload = {
      child_id: effectiveChildId,
      weekly_amount: weeklyAmount,
      day_of_week: dayOfWeek,
      time: time,
      enabled: !!enabled,
      updated_at: db.serverDate()
    }

    if (data && data.length > 0) {
      await collection.doc(data[0]._id).update({ data: payload })
    } else {
      await collection.add({
        data: {
          ...payload,
          created_at: db.serverDate(),
          last_sent_at: null
        }
      })
    }

    return {
      code: 200,
      message: '保存成功',
      data: {
        weeklyAmount,
        dayOfWeek,
        time,
        enabled,
        lastSentAt: data && data.length > 0 ? data[0].last_sent_at || null : null
      }
    }
  } catch (error) {
    console.error('更新每周配置失败', error)
    return {
      code: 500,
      message: '保存失败',
      error: error.message
    }
  }
}
