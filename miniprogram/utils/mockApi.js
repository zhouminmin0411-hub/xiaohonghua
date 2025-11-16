// Mock API - 用于前端开发阶段

// Mock 数据内联
const tasks = [
  {
    id: 1,
    type: "daily",
    icon: "🧹",
    title: "整理房间",
    description: "整理自己的房间，保持整洁",
    reward: 3,
    timeEstimate: "5分钟",
    isActive: true
  },
  {
    id: 2,
    type: "challenge",
    icon: "🚴",
    title: "完成1次10公里骑行",
    description: "骑自行车完成10公里",
    reward: 10,
    timeEstimate: "30分钟",
    isActive: true
  },
  {
    id: 3,
    type: "daily",
    icon: "🛏️",
    title: "自己叠被子",
    description: "早上起床后自己叠被子",
    reward: 2,
    timeEstimate: "3分钟",
    isActive: true
  }
]

const rewards = [
  {
    id: 1,
    title: "玩30分钟游戏",
    cost: 5,
    icon: "🎮",
    type: "virtual",
    isActive: true
  },
  {
    id: 2,
    title: "周末去游乐园",
    cost: 50,
    icon: "🎡",
    type: "real",
    isActive: true
  },
  {
    id: 3,
    title: "买心仪的玩具",
    cost: 100,
    icon: "🧸",
    type: "real",
    isActive: true
  },
  {
    id: 4,
    title: "选一部电影看",
    cost: 8,
    icon: "🎬",
    type: "virtual",
    isActive: true
  }
]

const app = getApp()

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 获取任务列表
async function getTasks() {
  await delay()
  
  // 获取本地任务状态
  const localRecords = wx.getStorageSync('taskRecords') || []
  const recordMap = {}
  localRecords.forEach(record => {
    recordMap[record.taskId] = record
  })
  
  // 合并任务状态
  const tasksWithStatus = tasks.map(task => ({
    ...task,
    status: recordMap[task.id]?.status || 'available',
    recordId: recordMap[task.id]?.id || null,
    parentLikedAt: recordMap[task.id]?.parentLikedAt || null
  }))
  
  return {
    success: true,
    data: tasksWithStatus
  }
}

// 领取任务
async function receiveTask(taskId) {
  await delay()
  
  const task = tasks.find(t => t.id === taskId)
  if (!task) {
    return { success: false, message: '任务不存在' }
  }
  
  // 获取本地记录
  let localRecords = wx.getStorageSync('taskRecords') || []
  
  // 检查是否已领取
  const existing = localRecords.find(r => r.taskId === taskId && r.status !== 'completed')
  if (existing) {
    return { success: false, message: '任务已领取' }
  }
  
  // 创建任务记录
  const record = {
    id: Date.now(),
    taskId: taskId,
    childId: 1,
    status: 'received',
    reward: task.reward,
    receivedAt: new Date().toISOString(),
    completedAt: null,
    parentLikedAt: null,
    taskTitle: task.title,
    taskIcon: task.icon
  }
  
  localRecords.push(record)
  wx.setStorageSync('taskRecords', localRecords)
  
  return {
    success: true,
    data: record
  }
}

// 完成任务
async function completeTask(taskId) {
  await delay()
  
  const task = tasks.find(t => t.id === taskId)
  if (!task) {
    return { success: false, message: '任务不存在' }
  }
  
  // 获取本地记录
  let localRecords = wx.getStorageSync('taskRecords') || []
  
  // 找到已领取的任务
  const record = localRecords.find(r => r.taskId === taskId && r.status === 'received')
  if (!record) {
    return { success: false, message: '请先领取任务' }
  }
  
  // 更新为已完成
  record.status = 'completed'
  record.completedAt = new Date().toISOString()
  wx.setStorageSync('taskRecords', localRecords)
  
  // 增加积分
  app.updatePoints(task.reward)
  
  // 记录积分历史
  let history = wx.getStorageSync('pointHistory') || []
  history.push({
    id: Date.now(),
    childId: 1,
    change: task.reward,
    reason: `完成任务：${task.title}`,
    sourceType: 'task',
    sourceId: taskId,
    createdAt: new Date().toISOString()
  })
  wx.setStorageSync('pointHistory', history)
  
  return {
    success: true,
    data: {
      record,
      pointsEarned: task.reward,
      currentPoints: app.globalData.currentPoints
    }
  }
}

// 获取奖励列表
async function getRewards() {
  await delay()
  return {
    success: true,
    data: rewards.filter(r => r.isActive)
  }
}

// 兑换奖励
async function redeemReward(rewardId) {
  await delay()
  
  const reward = rewards.find(r => r.id === rewardId)
  if (!reward) {
    return { success: false, message: '奖励不存在' }
  }
  
  // 检查积分是否足够
  if (app.globalData.currentPoints < reward.cost) {
    return { success: false, message: '积分不足' }
  }
  
  // 扣减积分
  app.updatePoints(-reward.cost)
  
  // 记录积分历史
  let history = wx.getStorageSync('pointHistory') || []
  history.push({
    id: Date.now(),
    childId: 1,
    change: -reward.cost,
    reason: `兑换奖励：${reward.title}`,
    sourceType: 'reward',
    sourceId: rewardId,
    createdAt: new Date().toISOString()
  })
  wx.setStorageSync('pointHistory', history)
  
  // 记录兑换记录
  let rewardRecords = wx.getStorageSync('rewardRecords') || []
  rewardRecords.push({
    id: Date.now(),
    rewardId: rewardId,
    childId: 1,
    cost: reward.cost,
    createdAt: new Date().toISOString()
  })
  wx.setStorageSync('rewardRecords', rewardRecords)
  
  return {
    success: true,
    data: {
      reward,
      currentPoints: app.globalData.currentPoints
    }
  }
}

// 获取当前积分
async function getCurrentPoints() {
  await delay()
  return {
    success: true,
    data: {
      points: app.globalData.currentPoints
    }
  }
}

// 获取积分历史
async function getPointHistory() {
  await delay()
  const history = wx.getStorageSync('pointHistory') || []
  return {
    success: true,
    data: history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

// 获取孩子完成记录
async function getTaskRecords() {
  await delay()
  const records = wx.getStorageSync('taskRecords') || []
  return {
    success: true,
    data: records
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  }
}

// 点赞任务
async function likeTask(recordId) {
  await delay()
  
  let localRecords = wx.getStorageSync('taskRecords') || []
  const record = localRecords.find(r => r.id === recordId)
  
  if (!record) {
    return { success: false, message: '记录不存在' }
  }
  
  record.parentLikedAt = new Date().toISOString()
  wx.setStorageSync('taskRecords', localRecords)
  
  return {
    success: true,
    data: record
  }
}

// 取消点赞
async function unlikeTask(recordId) {
  await delay()
  
  let localRecords = wx.getStorageSync('taskRecords') || []
  const record = localRecords.find(r => r.id === recordId)
  
  if (!record) {
    return { success: false, message: '记录不存在' }
  }
  
  record.parentLikedAt = null
  wx.setStorageSync('taskRecords', localRecords)
  
  return {
    success: true,
    data: record
  }
}

// 积分调整
async function adjustPoints(amount, reason) {
  await delay()
  
  app.updatePoints(amount)
  
  // 记录积分历史
  let history = wx.getStorageSync('pointHistory') || []
  history.push({
    id: Date.now(),
    childId: 1,
    change: amount,
    reason: reason || '家长积分调整',
    sourceType: 'adjustment',
    sourceId: null,
    createdAt: new Date().toISOString()
  })
  wx.setStorageSync('pointHistory', history)
  
  return {
    success: true,
    data: {
      currentPoints: app.globalData.currentPoints
    }
  }
}

// 验证家长密码
async function verifyParentPassword(password) {
  await delay()
  
  // Mock: 默认密码为 0000
  const correctPassword = '0000'
  
  if (password === correctPassword) {
    return {
      success: true,
      message: '验证成功'
    }
  } else {
    return {
      success: false,
      message: '密码错误'
    }
  }
}

// 创建任务
async function createTask(taskData) {
  await delay()
  
  const newTask = {
    id: Date.now(),
    ...taskData,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  
  let localTasks = wx.getStorageSync('customTasks') || []
  localTasks.push(newTask)
  wx.setStorageSync('customTasks', localTasks)
  
  return {
    success: true,
    data: newTask
  }
}

// 更新任务
async function updateTask(taskId, taskData) {
  await delay()
  
  let localTasks = wx.getStorageSync('customTasks') || []
  const index = localTasks.findIndex(t => t.id === taskId)
  
  if (index === -1) {
    return { success: false, message: '任务不存在' }
  }
  
  localTasks[index] = {
    ...localTasks[index],
    ...taskData,
    updatedAt: new Date().toISOString()
  }
  
  wx.setStorageSync('customTasks', localTasks)
  
  return {
    success: true,
    data: localTasks[index]
  }
}

// 删除任务(软删除)
async function deleteTask(taskId) {
  await delay()
  
  let localTasks = wx.getStorageSync('customTasks') || []
  const task = localTasks.find(t => t.id === taskId)
  
  if (!task) {
    return { success: false, message: '任务不存在' }
  }
  
  task.isActive = false
  wx.setStorageSync('customTasks', localTasks)
  
  return {
    success: true
  }
}

// 创建奖励
async function createReward(rewardData) {
  await delay()
  
  const newReward = {
    id: Date.now(),
    ...rewardData,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  
  let localRewards = wx.getStorageSync('customRewards') || []
  localRewards.push(newReward)
  wx.setStorageSync('customRewards', localRewards)
  
  return {
    success: true,
    data: newReward
  }
}

// 更新奖励
async function updateReward(rewardId, rewardData) {
  await delay()
  
  let localRewards = wx.getStorageSync('customRewards') || []
  const index = localRewards.findIndex(r => r.id === rewardId)
  
  if (index === -1) {
    return { success: false, message: '奖励不存在' }
  }
  
  localRewards[index] = {
    ...localRewards[index],
    ...rewardData,
    updatedAt: new Date().toISOString()
  }
  
  wx.setStorageSync('customRewards', localRewards)
  
  return {
    success: true,
    data: localRewards[index]
  }
}

// 删除奖励(软删除)
async function deleteReward(rewardId) {
  await delay()
  
  let localRewards = wx.getStorageSync('customRewards') || []
  const reward = localRewards.find(r => r.id === rewardId)
  
  if (!reward) {
    return { success: false, message: '奖励不存在' }
  }
  
  reward.isActive = false
  wx.setStorageSync('customRewards', localRewards)
  
  return {
    success: true
  }
}

// 获取每周配置
async function getWeeklyConfig() {
  await delay()
  
  const config = wx.getStorageSync('weeklyConfig') || {
    id: 1,
    childId: 1,
    weeklyAmount: 10,
    dayOfWeek: 1, // 周一
    time: '09:00',
    enabled: false
  }
  
  return {
    success: true,
    data: config
  }
}

// 更新每周配置
async function updateWeeklyConfig(configData) {
  await delay()
  
  wx.setStorageSync('weeklyConfig', configData)
  
  return {
    success: true,
    data: configData
  }
}

module.exports = {
  getTasks,
  receiveTask,
  completeTask,
  getRewards,
  redeemReward,
  getCurrentPoints,
  getPointHistory,
  getTaskRecords,
  likeTask,
  unlikeTask,
  adjustPoints,
  verifyParentPassword,
  createTask,
  updateTask,
  deleteTask,
  createReward,
  updateReward,
  deleteReward,
  getWeeklyConfig,
  updateWeeklyConfig
}
