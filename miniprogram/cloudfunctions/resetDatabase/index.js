// 云函数：resetDatabase - 清空云开发数据库数据
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()
const _ = db.command

const COLLECTIONS = [
  'users',
  'tasks',
  'task_records',
  'rewards',
  'reward_records',
  'point_history',
  'weekly_config'
]

const BATCH_SIZE = 20

async function deleteBatch(collectionName) {
  const { data } = await db.collection(collectionName).limit(BATCH_SIZE).get()
  if (!data || data.length === 0) {
    return 0
  }

  const ids = data.map((item) => item._id)
  const res = await db.collection(collectionName).where({ _id: _.in(ids) }).remove()
  return res && res.stats && typeof res.stats.removed === 'number' ? res.stats.removed : ids.length
}

async function clearCollection(collectionName) {
  let removedTotal = 0
  while (true) {
    const removed = await deleteBatch(collectionName)
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
  if (event.confirm !== 'RESET_ALL') {
    return {
      code: 400,
      message: 'Missing confirm token'
    }
  }

  const results = {}

  for (const name of COLLECTIONS) {
    try {
      const removed = await clearCollection(name)
      results[name] = { removed }
    } catch (error) {
      results[name] = { error: error.message || String(error) }
    }
  }

  return {
    code: 200,
    message: 'Database cleared',
    data: results
  }
}
