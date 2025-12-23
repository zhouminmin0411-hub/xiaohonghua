// 小朋友首页
const cloudApi = require('../../utils/cloudApi')
const animationUtil = require('../../utils/animation')
const dateUtil = require('../../utils/date')
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
    floatingNavHidden: false,
    goalPoints: 20,
    jarImage: '/assets/bottle_0.png',
    jarAnimate: false,
    petalCloud: [
      { rx: 140, ry: 18, duration: 12, phase: 0.1, scale: 0.9 },
      { rx: 135, ry: 16, duration: 12.8, phase: 0.35, scale: 0.86 },
      { rx: 150, ry: 20, duration: 13.5, phase: 0.6, scale: 0.95 },
      { rx: 145, ry: 14, duration: 12.5, phase: 0.8, scale: 0.9 },
      { rx: 130, ry: 18, duration: 13.2, phase: 0.25, scale: 0.92 },
      { rx: 138, ry: 12, duration: 11.5, phase: 0.55, scale: 0.88 }
    ]
  },

  async onLoad() {
    await app.ensureReady()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    this.updateJarState(app.globalData.currentPoints, this.data.goalPoints)
    this.loadTasks()
    this.updateGreeting()
  },

  async onShow() {
    await app.ensureReady()
    // 每次显示时更新积分
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    this.updateJarState(app.globalData.currentPoints, this.data.goalPoints)

    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  onHide() {
    this.clearScrollTimer()
    this.setData({ floatingNavHidden: false })
  },

  onUnload() {
    this.clearScrollTimer()
    this.clearJarTimer()
  },

  // 加载任务列表
  async loadTasks() {
    await app.ensureReady()
    const childId = app.globalData.childId
    if (!childId) {
      wx.showToast({
        title: '未获取到用户信息',
        icon: 'none'
      })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      const [taskList, records] = await Promise.all([
        cloudApi.getTasks(),
        cloudApi.getTaskRecords(childId)
      ])
      
      const tasks = this.mergeTaskStatus(taskList, records)
      this.updateTaskSummary(tasks)
      this.setData({
        tasks,
        loading: false
      })
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
      greeting = '夜深了，早点休息哦！'
    } else if (hour < 9) {
      greeting = '早上好，精神满满！'
    } else if (hour < 12) {
      greeting = '上午好，继续加油！'
    } else if (hour < 14) {
      greeting = '中午好，记得休息一下！'
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
    const goalPoints = Math.max(totalReward || 20, 20)
    this.setData({
      completedCount,
      totalReward,
      goalPoints
    })
    this.updateJarState(this.data.currentPoints, goalPoints)
  },

  // 领取任务
  async onReceiveTask(e) {
    const taskId = Number(e.currentTarget.dataset.id)
    const childId = app.globalData.childId
    
    if (!childId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 震动反馈
    animationUtil.vibrate('light')
    
    try {
      await cloudApi.receiveTask(childId, taskId)
      
      wx.showToast({
        title: '任务已领取',
        icon: 'success',
        duration: 1500
      })
      
      // 刷新数据
      await this.loadTasks()
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
    const recordId = e.currentTarget.dataset.recordId
    const { reward, title } = e.currentTarget.dataset
    
    if (!recordId) {
      wx.showToast({
        title: '请先领取任务',
        icon: 'none'
      })
      return
    }
    
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
      await cloudApi.completeTask(recordId)
      const points = await app.refreshPoints()
      this.setData({
        currentPoints: points
      })
      this.updateJarState(points, this.data.goalPoints)
      
      wx.showToast({
        title: `完成啦！+${reward} 小红花`,
        icon: 'success',
        duration: 2000
      })
      
      setTimeout(() => {
        this.loadTasks()
      }, 500)
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
    await app.ensureReady()
    await app.refreshPoints()
    await this.loadTasks()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    this.updateJarState(app.globalData.currentPoints, this.data.goalPoints)
    wx.stopPullDownRefresh()
  },
  
  mergeTaskStatus(tasks = [], records = []) {
    const recordMap = {}
    records.forEach(record => {
      const key = record.taskId
      const current = recordMap[key]
      const recordTime = this.getRecordTimestamp(record)
      if (!current || recordTime > this.getRecordTimestamp(current)) {
        recordMap[key] = record
      }
    })
    
    return tasks.map(task => {
      const record = recordMap[task.id]
      let status = 'available'
      if (record) {
        status = record.status === 'completed' ? 'completed' : 'received'
      }
      return {
        ...task,
        status,
        recordId: record?.id || null,
        parentLikedAt: record?.parentLikedAt || null
      }
    })
  },

  updateJarState(points = 0, goal = 20) {
    const safeGoal = Math.max(goal || 20, 1)
    const ratio = Math.max(0, Math.min(points / safeGoal, 1))
    let state = '0'
    if (ratio >= 0.85) {
      state = '100'
    } else if (ratio >= 0.6) {
      state = '75'
    } else if (ratio >= 0.35) {
      state = '50'
    } else if (ratio >= 0.1) {
      state = '25'
    }

    const imageMap = {
      '0': '/assets/bottle_0.png',
      '25': '/assets/bottle_25.png',
      '50': '/assets/bottle_50.png',
      '75': '/assets/bottle_75.png',
      '100': '/assets/bottle_100.png'
    }
    const jarImage = imageMap[state] || imageMap['0']

    const shouldPop = this.prevJarState !== state
    this.prevJarState = state

    this.setData({
      jarImage,
      goalPoints: Math.round(safeGoal),
      jarAnimate: shouldPop
    })

    if (shouldPop) {
      this.clearJarTimer()
      this.jarAnimTimer = setTimeout(() => {
        this.setData({ jarAnimate: false })
        this.jarAnimTimer = null
      }, 480)
    }
  },

  clearJarTimer() {
    if (this.jarAnimTimer) {
      clearTimeout(this.jarAnimTimer)
      this.jarAnimTimer = null
    }
  },
  
  getRecordTimestamp(record) {
    if (!record) return 0
    const time = record.completedAt || record.receivedAt || record.createdAt
    return dateUtil.getTimestamp(time)
  }
})
