// 小朋友首页
const mockApi = require('../../utils/mockApi')
const animationUtil = require('../../utils/animation')
const app = getApp()

Page({
  data: {
    currentPoints: 0,
    greeting: '加油，继续努力！',
    tasks: [],
    totalReward: 0,
    completedCount: 0,
    loading: false,
    showFlowerAnimation: false,
    flowerAnimationData: {},
    flowerX: 0,
    flowerY: 0,
    floatingNavHidden: false
  },

  onLoad() {
    this.loadTasks()
    this.updateGreeting()
  },

  onShow() {
    // 每次显示时更新积分
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
  },

  onHide() {
    this.clearScrollTimer()
    this.setData({ floatingNavHidden: false })
  },

  onUnload() {
    this.clearScrollTimer()
  },

  // 加载任务列表
  async loadTasks() {
    this.setData({ loading: true })
    
    try {
      const res = await mockApi.getTasks()
      if (res.success) {
        this.updateTaskSummary(res.data)
        this.setData({
          tasks: res.data,
          loading: false
        })
      }
    } catch (e) {
      console.error('加载任务失败', e)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  onPageScroll() {
    if (!this.data.floatingNavHidden) {
      this.setData({ floatingNavHidden: true })
    }
    this.resetScrollTimer()
  },

  resetScrollTimer() {
    this.clearScrollTimer()
    this.scrollHideTimer = setTimeout(() => {
      this.setData({ floatingNavHidden: false })
      this.scrollHideTimer = null
    }, 300)
  },

  clearScrollTimer() {
    if (this.scrollHideTimer) {
      clearTimeout(this.scrollHideTimer)
      this.scrollHideTimer = null
    }
  },

  // 更新问候语
  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = ''
    
    if (hour < 6) {
      greeting = '夜深了，早点休息哦~'
    } else if (hour < 9) {
      greeting = '早上好，新的一天开始啦！'
    } else if (hour < 12) {
      greeting = '上午好，加油完成任务！'
    } else if (hour < 14) {
      greeting = '中午好，记得休息一下~'
    } else if (hour < 18) {
      greeting = '下午好，继续加油！'
    } else if (hour < 22) {
      greeting = '晚上好，今天辛苦了！'
    } else {
      greeting = '该睡觉啦，明天再努力！'
    }
    
    this.setData({ greeting })
  },

  // 更新任务统计
  updateTaskSummary(tasks = []) {
    const completedCount = tasks.filter(task => task.status === 'completed').length
    const totalReward = tasks
      .filter(task => task.status === 'available' || task.status === 'received')
      .reduce((sum, task) => sum + (task.reward || 0), 0)
    this.setData({
      completedCount,
      totalReward
    })
  },

  // 领取任务
  async onReceiveTask(e) {
    const taskId = Number(e.currentTarget.dataset.id)
    
    // 震动反馈
    animationUtil.vibrate('light')
    
    try {
      const res = await mockApi.receiveTask(taskId)
      
      if (res.success) {
        wx.showToast({
          title: '任务已领取',
          icon: 'success',
          duration: 1500
        })
        
        // 刷新任务列表
        this.loadTasks()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    } catch (e) {
      console.error('领取任务失败', e)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 完成任务
  async onCompleteTask(e) {
    const id = Number(e.currentTarget.dataset.id)
    const { reward, title } = e.currentTarget.dataset
    
    // 获取按钮位置
    const query = wx.createSelectorQuery()
    query.select(`#task-btn-${id}`).boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        const rect = res[0]
        this.playFlowerAnimation(rect.left + rect.width / 2, rect.top)
      }
    })
    
    // 震动反馈
    animationUtil.vibrate('medium')
    
    try {
      const res = await mockApi.completeTask(id)
      
      if (res.success) {
        // 更新积分
        this.setData({
          currentPoints: res.data.currentPoints
        })
        
        wx.showToast({
          title: `完成啦！+${reward} 小红花`,
          icon: 'success',
          duration: 2000
        })
        
        // 刷新任务列表
        setTimeout(() => {
          this.loadTasks()
        }, 500)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    } catch (e) {
      console.error('完成任务失败', e)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 打开设置页
  onOpenSettings() {
    wx.reLaunch({
      url: '/pages/settings/settings'
    })
  },

  // 自定义底部导航
  onNavigateTab(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    wx.reLaunch({ url: path })
  },

  // 播放小红花飞入动画
  playFlowerAnimation(startX, startY) {
    // 获取目标位置（小红花计数器）
    const query = wx.createSelectorQuery()
    query.select('.flower-counter').boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        const endX = res[0].left + res[0].width / 2
        const endY = res[0].top + res[0].height / 2
        
        this.setData({
          showFlowerAnimation: true,
          flowerX: startX,
          flowerY: startY
        })
        
        // 创建动画
        const animation = wx.createAnimation({
          duration: 600,
          timingFunction: 'ease-out'
        })
        
        const deltaX = endX - startX
        const deltaY = endY - startY
        
        animation
          .translate(deltaX, deltaY)
          .scale(0.3)
          .opacity(0)
          .step()
        
        this.setData({
          flowerAnimationData: animation.export()
        })
        
        // 动画结束后隐藏
        setTimeout(() => {
          this.setData({
            showFlowerAnimation: false
          })
        }, 600)
      }
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadTasks()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    wx.stopPullDownRefresh()
  }
})
