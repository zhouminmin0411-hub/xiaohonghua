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
      parentUserId: null,
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
      await this.ensureUserProfile()
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
        const normalizedUser = this.normalizeUser(parsed)
        this.globalData.userInfo = normalizedUser
        // 云数据库使用 _id，兼容处理
        const userId = normalizedUser._id || normalizedUser.id
        this.globalData.childId = normalizedUser.role === 'child' ? userId : (normalizedUser.child_id || normalizedUser.childId)
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
    try {
      // 调用云函数登录
      const user = await cloudApi.login()
      
      if (user) {
        const normalizedUser = this.normalizeUser(user)
        this.globalData.userInfo = normalizedUser
        // 云数据库使用 _id，兼容处理
        const userId = normalizedUser._id || normalizedUser.id
        this.globalData.childId = normalizedUser.role === 'child' ? userId : (normalizedUser.child_id || normalizedUser.childId)
        wx.setStorageSync('userInfo', JSON.stringify(normalizedUser))
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

  normalizeUser(user) {
    if (!user) return user
    const avatarUrl = user.avatarUrl || user.avatar_url || ''
    const childId = user.childId || user.child_id || null
    return {
      ...user,
      avatarUrl,
      childId
    }
  },

  isPlaceholderNickname(nickname) {
    const normalized = typeof nickname === 'string' ? nickname.trim() : ''
    if (!normalized) {
      return true
    }
    return normalized === '小红花宝宝' || normalized === '微信用户'
  },

  needsProfile(user) {
    if (!user) return false
    const nickname = typeof user.nickname === 'string' ? user.nickname.trim() : ''
    return this.isPlaceholderNickname(nickname) || !user.avatarUrl
  },

  async ensureUserProfile() {
    const currentUser = this.globalData.userInfo
    if (!this.needsProfile(currentUser)) {
      return
    }

    const silentProfile = await this.tryGetUserProfileSilently()
    if (silentProfile) {
      await this.applyUserProfile(silentProfile)
    }
  },

  async tryGetUserProfileSilently() {
    if (typeof wx.getUserInfo !== 'function') {
      return null
    }
    try {
      const res = await wx.getUserInfo({ withCredentials: false, lang: 'zh_CN' })
      const userInfo = res && res.userInfo ? res.userInfo : null
      if (!userInfo) {
        return null
      }
      const nickname = userInfo.nickName || userInfo.nickname || ''
      const avatarUrl = userInfo.avatarUrl || userInfo.avatar_url || ''
      if (this.isPlaceholderNickname(nickname) || !avatarUrl) {
        return null
      }
      return userInfo
    } catch (error) {
      return null
    }
  },

  async requestUserProfile() {
    if (typeof wx.getUserProfile !== 'function') {
      wx.showToast({
        title: '当前版本不支持授权',
        icon: 'none'
      })
      return false
    }

    try {
      const profileRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于展示头像和昵称',
          success: resolve,
          fail: reject
        })
      })

      if (profileRes && profileRes.userInfo) {
        return await this.applyUserProfile(profileRes.userInfo)
      }
    } catch (error) {
      console.warn('获取用户信息失败', error)
    }

    return false
  },

  async applyUserProfile(userInfo) {
    if (!userInfo) return false
    const nickname = userInfo.nickName || userInfo.nickname || ''
    const avatarUrl = userInfo.avatarUrl || userInfo.avatar_url || ''
    const updatePayload = {}
    if (nickname && !this.isPlaceholderNickname(nickname)) {
      updatePayload.nickname = nickname
    }
    if (avatarUrl) {
      updatePayload.avatarUrl = avatarUrl
    }

    if (Object.keys(updatePayload).length === 0) {
      if (this.isPlaceholderNickname(nickname)) {
        wx.showToast({
          title: '开发者工具会返回“微信用户”，真机可获取真实昵称',
          icon: 'none'
        })
      }
      return false
    }

    try {
      const updated = await cloudApi.updateUserProfile(updatePayload)
      const nextUser = this.normalizeUser(updated || {
        ...this.globalData.userInfo,
        nickname: updatePayload.nickname || this.globalData.userInfo?.nickname,
        avatarUrl: updatePayload.avatarUrl || this.globalData.userInfo?.avatarUrl
      })
      this.globalData.userInfo = nextUser
      wx.setStorageSync('userInfo', JSON.stringify(nextUser))
      return true
    } catch (error) {
      console.error('更新用户资料失败', error)
    }
    return false
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
