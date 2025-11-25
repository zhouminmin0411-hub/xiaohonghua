// app.js
const api = require('./utils/realApi')

App({
  async onLaunch() {
    console.log('小红花小程序启动')
    
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
        this.globalData.childId = parsed.role === 'child' ? parsed.id : parsed.childId
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
      const openid = 'mock_child_openid_001'
      const user = await api.login(openid)
      this.globalData.userInfo = user
      this.globalData.childId = user.role === 'child' ? user.id : user.childId
      wx.setStorageSync('userInfo', JSON.stringify(user))
    } catch (error) {
      console.error('登录失败', error)
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      })
    }
  },
  
  async refreshPoints() {
    if (!this.globalData.childId) return
    
    try {
      const result = await api.getCurrentPoints(this.globalData.childId)
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

