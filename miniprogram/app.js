// app.js
const cloudApi = require('./utils/cloudApi')

App({
  async onLaunch() {
    console.log('小红花小程序启动')
    
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-6gmt7m654faa5008',
      traceUser: true
    })
    
    this.globalData = {
      userInfo: null,
      childId: null,
      parentUserId: 2, // 默认家长用户（seed数据）
      currentPoints: 0,
      token: null,
      isParentMode: false
    }
    
    this.readyPromise = this.initApp()
  },
  
  async initApp() {
    this.loadCachedData()
    try {
      await this.login()
      await this.refreshPoints()
    } catch (error) {
      console.error('初始化失败', error)
    }
  },
  
  loadCachedData() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      const cachedPoints = wx.getStorageSync('currentPoints')
      
      if (userInfo) {
        const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
        this.globalData.userInfo = parsed
        // 云数据库使用 _id，兼容处理
        const userId = parsed._id || parsed.id
        this.globalData.childId = parsed.role === 'child' ? userId : (parsed.child_id || parsed.childId)
      }
      
      if (token) {
        this.globalData.token = token
      }
      
      if (typeof cachedPoints === 'number') {
        this.globalData.currentPoints = cachedPoints
      }
    } catch (error) {
      console.error('加载本地数据失败', error)
    }
  },
  
  async login() {
    if (this.globalData.userInfo && this.globalData.childId) {
      return
    }
    
    try {
      // 调用云函数登录
      const user = await cloudApi.login()
      
      if (user) {
        this.globalData.userInfo = user
        // 云数据库使用 _id，兼容处理
        const userId = user._id || user.id
        this.globalData.childId = user.role === 'child' ? userId : (user.child_id || user.childId)
        wx.setStorageSync('userInfo', JSON.stringify(user))
        console.log('登录成功，用户信息:', user)
      }
    } catch (error) {
      console.error('登录失败', error)
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      })
    }
  },
  
  // 封装wx.login为Promise
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },
  
  async refreshPoints() {
    if (!this.globalData.childId) return
    
    try {
      const result = await cloudApi.getCurrentPoints(this.globalData.childId)
      const points = result?.points ?? 0
      this.globalData.currentPoints = points
      wx.setStorageSync('currentPoints', points)
      return points
    } catch (error) {
      console.error('获取积分失败', error)
      return this.globalData.currentPoints
    }
  },
  
  ensureReady() {
    return this.readyPromise || Promise.resolve()
  },
  
  // 切换家长模式
  switchToParentMode() {
    this.globalData.isParentMode = true
  },
  
  // 退出家长模式
  exitParentMode() {
    this.globalData.isParentMode = false
  }
})

