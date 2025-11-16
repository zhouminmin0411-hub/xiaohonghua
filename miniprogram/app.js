// app.js
App({
  onLaunch() {
    console.log('小红花小程序启动')
    
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      currentPoints: 0,
      token: null,
      isParentMode: false
    }
    
    // 从本地存储加载用户数据
    this.loadUserData()
    
    // 初始化积分
    this.loadPoints()
  },
  
  loadUserData() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      
      if (userInfo) {
        this.globalData.userInfo = JSON.parse(userInfo)
      }
      
      if (token) {
        this.globalData.token = token
      }
    } catch (e) {
      console.error('加载用户数据失败', e)
    }
  },
  
  loadPoints() {
    try {
      // 从本地存储加载积分历史
      let pointHistory = wx.getStorageSync('pointHistory')
      
      // 如果没有历史记录，初始化默认值
      if (!pointHistory) {
        // 初始化默认积分历史（Mock数据）
        pointHistory = [
          {
            id: 1,
            childId: 1,
            change: 10,
            reason: "每周固定积分",
            sourceType: "weekly",
            sourceId: null,
            createdAt: "2025-11-11T09:00:00Z"
          },
          {
            id: 2,
            childId: 1,
            change: 2,
            reason: "完成任务：自己叠被子",
            sourceType: "task",
            sourceId: 3,
            createdAt: "2025-11-15T07:05:00Z"
          }
        ]
        // 保存到本地存储
        wx.setStorageSync('pointHistory', pointHistory)
      }
      
      // 计算总积分
      const totalPoints = pointHistory.reduce((sum, record) => sum + record.change, 0)
      this.globalData.currentPoints = Math.max(0, totalPoints)
      
      // 保存到本地存储
      wx.setStorageSync('currentPoints', this.globalData.currentPoints)
    } catch (e) {
      console.error('加载积分失败', e)
      this.globalData.currentPoints = 0
    }
  },
  
  // 更新积分
  updatePoints(change) {
    this.globalData.currentPoints += change
    if (this.globalData.currentPoints < 0) {
      this.globalData.currentPoints = 0
    }
    wx.setStorageSync('currentPoints', this.globalData.currentPoints)
    return this.globalData.currentPoints
  },
  
  // 切换家长模式
  switchToParentMode() {
    this.globalData.isParentMode = true
  },
  
  // 退出家长模式
  exitParentMode() {
    this.globalData.isParentMode = false
  },
  
  globalData: {
    userInfo: null,
    currentPoints: 0,
    token: null,
    isParentMode: false
  }
})

