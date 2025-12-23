/**
 * 云函数API封装
 */

// 调用云函数的通用方法
async function callFunction(name, data = {}, showLoading = false) {
  try {
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true })
    }
    
    const res = await wx.cloud.callFunction({
      name,
      data
    })
    
    if (showLoading) {
      wx.hideLoading()
    }
    
    if (res.result && res.result.code === 200) {
      return res.result.data
    } else {
      const message = res.result?.message || '操作失败'
      wx.showToast({
        title: message,
        icon: 'none'
      })
      return null
    }
    
  } catch (error) {
    if (showLoading) {
      wx.hideLoading()
    }
    console.error(`调用云函数 ${name} 失败`, error)
    wx.showToast({
      title: '网络错误',
      icon: 'none'
    })
    return null
  }
}

// ========== 用户相关 ==========

/**
 * 用户登录
 */
export async function login() {
  return await callFunction('login', {})
}

// ========== 任务相关 ==========

/**
 * 获取任务列表
 */
export async function getTasks() {
  return await callFunction('getTasks', {})
}

/**
 * 领取任务
 */
export async function receiveTask(childId, taskId) {
  return await callFunction('receiveTask', { childId, taskId })
}

/**
 * 完成任务
 */
export async function completeTask(recordId) {
  return await callFunction('completeTask', { recordId })
}

/**
 * 获取任务记录
 */
export async function getTaskRecords(childId, status) {
  return await callFunction('getTaskRecords', { childId, status })
}

// ========== 积分相关 ==========

/**
 * 获取当前积分
 */
export async function getCurrentPoints(childId) {
  const result = await callFunction('getCurrentPoints', { childId })
  return result ? { points: result.points || 0 } : { points: 0 }
}

/**
 * 获取积分历史
 */
export async function getPointHistory(childId) {
  return await callFunction('getPointHistory', { childId })
}

// ========== 奖品相关 ==========

/**
 * 获取奖品列表
 */
export async function getRewards() {
  return await callFunction('getRewards', {})
}

/**
 * 兑换奖品
 */
export async function exchangeReward(childId, rewardId) {
  return await callFunction('exchangeReward', { childId, rewardId })
}

// ========== 家长端 - 任务管理 ==========

/**
 * 创建任务
 */
export async function createTask(taskData) {
  return await callFunction('createTask', taskData)
}

/**
 * 更新任务
 */
export async function updateTask(taskId, taskData) {
  return await callFunction('updateTask', { taskId, ...taskData })
}

/**
 * 删除任务
 */
export async function deleteTask(taskId) {
  return await callFunction('deleteTask', { taskId })
}

// ========== 家长端 - 奖品管理 ==========

/**
 * 创建奖品
 */
export async function createReward(rewardData) {
  return await callFunction('createReward', rewardData)
}

/**
 * 更新奖品
 */
export async function updateReward(rewardId, rewardData) {
  return await callFunction('updateReward', { rewardId, ...rewardData })
}

/**
 * 删除奖品
 */
export async function deleteReward(rewardId) {
  return await callFunction('deleteReward', { rewardId })
}

// ========== 家长端 - 积分管理 ==========

/**
 * 手动调整积分
 */
export async function adjustPoints(childId, change, reason) {
  return await callFunction('adjustPoints', { childId, change, reason })
}

