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
      // 调用微信登录获取code
      const loginRes = await this.wxLogin()
      console.log('wx.login获取code成功:', loginRes.code)
      
      // 将code发送到后端，后端会用code换取openid并处理用户登录
      const user = await api.loginWithCode(loginRes.code)
      
      this.globalData.userInfo = user
      this.globalData.childId = user.role === 'child' ? user.id : user.childId
      wx.setStorageSync('userInfo', JSON.stringify(user))
      
      console.log('登录成功，用户信息:', user)
    } catch (error) {
      console.error('登录失败', error)
      
      // 如果登录失败，尝试使用mock数据（开发阶段）
      console.warn('使用mock数据登录')
      try {
        const openid = 'mock_child_openid_001'
        const user = await api.login(openid)
        this.globalData.userInfo = user
        this.globalData.childId = user.role === 'child' ? user.id : user.childId
        wx.setStorageSync('userInfo', JSON.stringify(user))
      } catch (mockError) {
        console.error('Mock登录也失败', mockError)
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
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

