// 云函数：resetMyData - 清理当前用户数据（不删账号）
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

const BATCH_SIZE = 20

async function getCurrentUser() {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return null
  const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  return data && data.length > 0 ? data[0] : null
}

async function deleteBatch(collectionName, where) {
  const { data } = await db.collection(collectionName).where(where).limit(BATCH_SIZE).get()
  if (!data || data.length === 0) {
    return 0
  }

  const ids = data.map((item) => item._id)
  const res = await db.collection(collectionName).where({ _id: _.in(ids) }).remove()
  return res && res.stats && typeof res.stats.removed === 'number' ? res.stats.removed : ids.length
}

async function clearCollection(collectionName, where) {
  let removedTotal = 0
  while (true) {
    const removed = await deleteBatch(collectionName, where)
    if (!removed) {
      break
    }
    removedTotal += removed
    if (removed < BATCH_SIZE) {
      break
    }
  }
  return removedTotal
}

exports.main = async (event = {}) => {
  if (event.confirm !== 'RESET_ME') {
    return {
      code: 400,
      message: 'Missing confirm token'
    }
  }

  const user = await getCurrentUser()
  if (!user) {
    return {
      code: 401,
      message: '未登录'
    }
  }

  const userId = user._id
  const results = {}
  const deletions = [
    { name: 'task_records', where: { child_id: userId } },
    { name: 'reward_records', where: { child_id: userId } },
    { name: 'point_history', where: { child_id: userId } },
    { name: 'weekly_config', where: { child_id: userId } },
    { name: 'tasks', where: { created_by_parent_id: userId } },
    { name: 'rewards', where: { created_by_parent_id: userId } }
  ]

  for (const item of deletions) {
    try {
      const removed = await clearCollection(item.name, item.where)
      results[item.name] = { removed }
    } catch (error) {
      results[item.name] = { error: error.message || String(error) }
    }
  }

  if (event.deleteUser) {
    try {
      await db.collection('users').doc(userId).remove()
      results.user = { removed: 1 }
    } catch (error) {
      results.user = { error: error.message || String(error) }
    }
  } else if (event.resetProfile) {
    try {
      await db.collection('users').doc(userId).update({
        data: {
          nickname: '小红花宝宝',
          avatar_url: '',
          parent_password: null,
          child_id: null,
          role: 'child',
          updated_at: db.serverDate()
        }
      })
      results.user = { resetProfile: true }
    } catch (error) {
      results.user = { error: error.message || String(error) }
    }
  }

  return {
    code: 200,
    message: 'User data cleared',
    data: {
      userId,
      results
    }
  }
}
