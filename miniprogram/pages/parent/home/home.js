// pages/parent/home/home.js
const mockApi = require('../../../utils/mockApi')
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

  onLoad() {
    this.loadWeeklyStats()
    this.loadCompletedTasks()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadWeeklyStats()
    this.loadCompletedTasks()
  },

  // 加载本周统计数据
  async loadWeeklyStats() {
    try {
      // 获取本周开始时间
      const weekStart = this.getWeekStart()
      
      // 获取任务记录
      const records = wx.getStorageSync('taskRecords') || []
      const weeklyRecords = records.filter(r => {
        if (r.status !== 'completed' || !r.completedAt) return false
        const completedTime = new Date(r.completedAt)
        return completedTime >= weekStart
      })

      // 计算统计数据
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
    try {
      const result = await mockApi.getTaskRecords()
      if (result.success) {
        const tasks = result.data.map(task => ({
          ...task,
          completedTime: this.formatTime(task.completedAt)
        }))
        this.setData({
          completedTasks: tasks
        })
      }
    } catch (e) {
      console.error('加载完成任务失败', e)
    }
  },

  // 格式化时间
  formatTime(isoString) {
    const date = new Date(isoString)
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
      const result = await mockApi.likeTask(id)
      if (result.success) {
        wx.showToast({
          title: '点赞成功！',
          icon: 'success'
        })
        // 刷新列表
        this.loadCompletedTasks()
        this.loadWeeklyStats()
      }
    } catch (e) {
      wx.showToast({
        title: '点赞失败',
        icon: 'error'
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

