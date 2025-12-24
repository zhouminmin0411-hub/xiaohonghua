// pages/parent/home/home.js
const api = require('../../../utils/cloudApi')
const dateUtil = require('../../../utils/date')
const app = getApp()

Page({
  data: {
    weeklyStats: {
      completedCount: 0,
      totalPoints: 0,
      likedCount: 0
    },
    completedTasks: []
  },

  async onLoad() {
    await app.ensureReady()
    this.loadWeeklyStats()
    this.loadCompletedTasks()
  },

  async onShow() {
    await app.ensureReady()
    // 每次显示时刷新数据
    this.loadWeeklyStats()
    this.loadCompletedTasks()
  },

  // 加载本周统计数据
  async loadWeeklyStats() {
    await app.ensureReady()
    const childId = app.globalData.childId
    if (!childId) {
      return
    }
    try {
      const weekStart = this.getWeekStart()
      const records = await api.getTaskRecords(childId, 'completed')
      const weeklyRecords = records.filter(record => {
        if (!record.completedAt) return false
        const completedDate = dateUtil.parseDateTime(record.completedAt)
        return completedDate && completedDate >= weekStart
      })

      const completedCount = weeklyRecords.length
      const totalPoints = weeklyRecords.reduce((sum, r) => sum + (r.reward || 0), 0)
      const likedCount = weeklyRecords.filter(r => r.parentLikedAt).length

      this.setData({
        weeklyStats: {
          completedCount,
          totalPoints,
          likedCount
        }
      })
    } catch (e) {
      console.error('加载本周统计失败', e)
    }
  },

  // 获取本周一的日期
  getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  },

  // 加载已完成任务列表
  async loadCompletedTasks() {
    await app.ensureReady()
    const childId = app.globalData.childId
    if (!childId) {
      return
    }
    try {
      const result = await api.getTaskRecords(childId, 'completed')
      const tasks = (result || [])
        .map(task => ({
          ...task,
          completedTime: this.formatTime(task.completedAt)
        }))
      this.setData({
        completedTasks: tasks.slice(0, 10)
      })
    } catch (e) {
      console.error('加载完成任务失败', e)
    }
  },

  // 格式化时间
  formatTime(isoString) {
    const date = dateUtil.parseDateTime(isoString)
    if (!date) return ''
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${month}月${day}日 ${hour}:${minute < 10 ? '0' + minute : minute}`
  },

  // 点赞任务
  async onLikeTask(e) {
    const { id } = e.currentTarget.dataset
    try {
      await api.likeTask(id)
      wx.showToast({
        title: '点赞成功！',
        icon: 'success'
      })
      this.loadCompletedTasks()
      this.loadWeeklyStats()
    } catch (e) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 跳转到任务管理
  goToTaskManagement() {
    wx.navigateTo({
      url: '/pages/parent/tasks/tasks'
    })
  },

  // 跳转到奖励管理
  goToRewardManagement() {
    wx.navigateTo({
      url: '/pages/parent/rewards/rewards'
    })
  },

  // 跳转到积分调整
  goToPointAdjustment() {
    wx.navigateTo({
      url: '/pages/parent/points/points'
    })
  },

  // 跳转到每周配置
  goToWeeklyConfig() {
    wx.navigateTo({
      url: '/pages/parent/weekly/weekly'
    })
  },

  // 退出家长视角
  exitParentMode() {
    wx.showModal({
      title: '提示',
      content: '确定退出家长视角吗？',
      success: (res) => {
        if (res.confirm) {
          app.exitParentMode()
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  }
})
