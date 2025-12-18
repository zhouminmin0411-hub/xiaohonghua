/**
 * 真实API封装
 */

const CONFIG = {
  DEV_BASE_URL: 'http://localhost:8081/api',
  PROD_BASE_URL: 'https://your-domain.com/api',
  ENV: 'dev'
}

const getBaseURL = () => CONFIG.ENV === 'dev' ? CONFIG.DEV_BASE_URL : CONFIG.PROD_BASE_URL

function request({ url, method = 'GET', data = {}, header = {}, showLoading = false }) {
  if (showLoading) {
    wx.showLoading({ title: '加载中', mask: true })
  }

  const token = wx.getStorageSync('authToken') || ''

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseURL()}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header
      },
      success(res) {
        const { statusCode, data } = res
        if (statusCode === 200 && data.code === 200) {
          resolve(data.data)
        } else {
          wx.showToast({ title: data.message || '请求失败', icon: 'none' })
          reject(data)
        }
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      },
      complete() {
        if (showLoading) {
          wx.hideLoading()
        }
      }
    })
  })
}

// 认证
function login(openid) {
  return request({ url: '/auth/login', method: 'POST', data: { openid }, showLoading: true })
}

function verifyParentPassword(userId, password) {
  return request({ url: '/auth/verify-parent-password', method: 'POST', data: { userId, password }, showLoading: true })
}

// 任务
function getTasks() {
  return request({ url: '/tasks' })
}

function createTask(taskData) {
  return request({ url: '/tasks', method: 'POST', data: taskData, showLoading: true })
}

function updateTask(taskId, taskData) {
  return request({ url: `/tasks/${taskId}`, method: 'PUT', data: taskData, showLoading: true })
}

function deleteTask(taskId) {
  return request({ url: `/tasks/${taskId}`, method: 'DELETE', showLoading: true })
}

// 任务记录
function receiveTask(childId, taskId) {
  return request({ url: `/task-records/receive?childId=${childId}&taskId=${taskId}`, method: 'POST', data: {}, showLoading: true })
}

function completeTask(recordId) {
  return request({ url: `/task-records/complete?recordId=${recordId}`, method: 'POST', data: {}, showLoading: true })
}

function getTaskRecords(childId, status = '') {
  const query = status ? `&status=${status}` : ''
  return request({ url: `/task-records?childId=${childId}${query}` })
}

function likeTask(recordId) {
  return request({ url: `/task-records/${recordId}/like`, method: 'POST' })
}

function unlikeTask(recordId) {
  return request({ url: `/task-records/${recordId}/like`, method: 'DELETE' })
}

// 奖励
function getRewards() {
  return request({ url: '/rewards' })
}

function createReward(rewardData) {
  return request({ url: '/rewards', method: 'POST', data: rewardData, showLoading: true })
}

function updateReward(rewardId, rewardData) {
  return request({ url: `/rewards/${rewardId}`, method: 'PUT', data: rewardData, showLoading: true })
}

function deleteReward(rewardId) {
  return request({ url: `/rewards/${rewardId}`, method: 'DELETE', showLoading: true })
}

// 兑换记录
function redeemReward(childId, rewardId) {
  return request({ url: `/reward-records/redeem?childId=${childId}&rewardId=${rewardId}`, method: 'POST', data: {}, showLoading: true })
}

function getRewardRecords(childId) {
  return request({ url: `/reward-records?childId=${childId}` })
}

// 积分
function getCurrentPoints(childId) {
  return request({ url: `/points/current?childId=${childId}` })
}

function getPointHistory(childId) {
  return request({ url: `/points/history?childId=${childId}` })
}

function adjustPoints(childId, change, reason) {
  return request({ url: '/points/adjust', method: 'POST', data: { childId, change, reason }, showLoading: true })
}

// 每周配置
function getWeeklyConfig(childId) {
  return request({ url: `/weekly-config?childId=${childId}` })
}

function updateWeeklyConfig(childId, config) {
  return request({ url: `/weekly-config?childId=${childId}`, method: 'PUT', data: config, showLoading: true })
}

module.exports = {
  login,
  verifyParentPassword,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  receiveTask,
  completeTask,
  getTaskRecords,
  likeTask,
  unlikeTask,
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  getRewardRecords,
  getCurrentPoints,
  getPointHistory,
  adjustPoints,
  getWeeklyConfig,
  updateWeeklyConfig
}
