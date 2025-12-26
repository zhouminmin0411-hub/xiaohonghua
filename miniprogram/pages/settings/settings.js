// 设置页面
const api = require('../../utils/cloudApi')
const app = getApp()

Page({
  data: {
    userInfo: {},
    avatarDisplayUrl: '',
    isParentMode: false,
    showPasswordDialog: false,
    password: '',
    tempNickname: '',
    isOnboarding: false,
    canFinish: false,
    showParentGuide: false
  },

  async onLoad(options) {
    await app.ensureReady()
    const isOnboarding = options.onboarding === 'true'
    this.setData({
      isOnboarding,
      isParentMode: app.globalData.isParentMode
    })
    this.loadUserInfo()
  },

  onShow() {
    // 更新家长模式状态
    this.setData({
      isParentMode: app.globalData.isParentMode
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const normalized = this.normalizeUserInfo(userInfo)
      this.setData({
        userInfo: normalized,
        tempNickname: normalized.nickname || '',
        avatarDisplayUrl: this.getDisplayAvatarUrl(normalized.avatarUrl)
      })
      return
    }

    try {
      const cached = wx.getStorageSync('userInfo')
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        const normalized = this.normalizeUserInfo(parsed)
        this.setData({
          userInfo: normalized,
          tempNickname: normalized.nickname || '',
          avatarDisplayUrl: this.getDisplayAvatarUrl(normalized.avatarUrl)
        })
      } else {
        this.setData({
          avatarDisplayUrl: '/assets/default-avatar.png'
        })
      }
    } catch (e) {
      console.error('加载用户信息失败', e)
      this.setData({
        avatarDisplayUrl: '/assets/default-avatar.png'
      })
    }
  },

  normalizeUserInfo(userInfo) {
    if (!userInfo) return userInfo
    const avatarUrl = userInfo.avatarUrl || userInfo.avatar_url || ''
    return {
      ...userInfo,
      avatarUrl
    }
  },

  // 获取显示用的头像URL
  getDisplayAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
      return '/assets/default-avatar.png'
    }
    // 如果是相对路径（以/uploads开头），加上后端服务器地址
    if (avatarUrl.startsWith('/uploads')) {
      return 'http://127.0.0.1:8081/api' + avatarUrl
    }
    // 如果是以//开头（协议相对），加上https:
    if (avatarUrl.startsWith('//')) {
      return 'https:' + avatarUrl
    }
    // 如果是完整URL，直接返回
    return avatarUrl
  },

  // 选择头像
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择的头像:', avatarUrl)

    try {
      const userId = app.globalData.userInfo?._id || app.globalData.userInfo?.id
      if (!userId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      wx.showLoading({
        title: '上传中...',
        mask: true
      })

      // 上传头像到服务器
      const result = await api.uploadAvatar(userId, avatarUrl)

      // 更新本地数据
      const newUserInfo = {
        ...this.data.userInfo,
        avatarUrl: result?.avatarUrl || avatarUrl
      }

      this.setData({
        userInfo: newUserInfo,
        avatarDisplayUrl: this.getDisplayAvatarUrl(newUserInfo.avatarUrl)
      })
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', JSON.stringify(newUserInfo))

      wx.hideLoading()
      wx.showToast({
        title: '头像已同步',
        icon: 'success'
      })
      this.checkInput()
    } catch (error) {
      wx.hideLoading()
      console.error('上传头像失败', error)
      const newUserInfo = {
        ...this.data.userInfo,
        avatarUrl: avatarUrl
      }
      this.setData({
        userInfo: newUserInfo,
        avatarDisplayUrl: avatarUrl
      })
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', JSON.stringify(newUserInfo))
      this.checkInput()
    }
  },

  checkInput() {
    const { userInfo, tempNickname } = this.data
    const nicknameToCheck = (tempNickname || userInfo?.nickname || '').trim()
    const hasValidNickname = nicknameToCheck && !this.isPlaceholderNickname(nicknameToCheck)
    const hasAvatar = !!(userInfo?.avatarUrl)

    console.log('[CheckInput]', { nicknameToCheck, hasValidNickname, hasAvatar, tempNickname })

    this.setData({
      canFinish: !!hasAvatar && !!hasValidNickname
    })
  },

  isPlaceholderNickname(nickname) {
    if (typeof app.isPlaceholderNickname === 'function') {
      return app.isPlaceholderNickname(nickname)
    }
    const normalized = typeof nickname === 'string' ? nickname.trim() : ''
    if (!normalized) {
      return true
    }
    return normalized === '小红花宝宝' || normalized === '微信用户'
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      tempNickname: e.detail.value
    }, () => {
      this.checkInput()
    })
  },

  // 昵称失去焦点（保存昵称）
  async onNicknameBlur() {
    const { tempNickname, userInfo } = this.data

    // 如果昵称没有变化，不做处理
    if (!tempNickname || tempNickname === userInfo.nickname) {
      return
    }

    try {
      const userId = app.globalData.userInfo?._id || app.globalData.userInfo?.id
      if (!userId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      wx.showLoading({
        title: '保存中...',
        mask: true
      })

      // 更新昵称到服务器
      await api.updateUserProfile(userId, { nickname: tempNickname })

      // 更新本地数据
      const newUserInfo = {
        ...userInfo,
        nickname: tempNickname
      }

      this.setData({ userInfo: newUserInfo })
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', JSON.stringify(newUserInfo))

      wx.hideLoading()
      this.checkInput()
    } catch (error) {
      wx.hideLoading()
      console.error('更新昵称失败', error)
      const newUserInfo = {
        ...userInfo,
        nickname: tempNickname
      }
      this.setData({ userInfo: newUserInfo })
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', JSON.stringify(newUserInfo))
      this.checkInput()
    }
  },

  async onFinishOnboarding() {
    if (!this.data.canFinish) {
      wx.showToast({
        title: '请完善头像和昵称哦',
        icon: 'none'
      })
      return
    }

    const { userInfo, tempNickname } = this.data

    // 强制同步一次最新资料到全局和缓存，防止 blur 未触发导致的延迟
    const updatedUser = {
      ...app.globalData.userInfo,
      ...userInfo,
      nickname: tempNickname || userInfo.nickname
    }
    app.globalData.userInfo = updatedUser
    wx.setStorageSync('userInfo', JSON.stringify(updatedUser))

    try {
      // 同时也尝试后台静默更新一次服务器（防止只有本地成功）
      const userId = updatedUser._id || updatedUser.id
      if (userId) {
        api.updateUserProfile(userId, {
          nickname: updatedUser.nickname,
          avatarUrl: updatedUser.avatarUrl
        }).catch(err => console.error('Silent update failed', err))
      }
    } catch (e) { }

    // 标记需要展示主页指引
    wx.setStorageSync('showParentGuide', true)

    wx.showToast({
      title: '设置好了！',
      icon: 'success',
      duration: 1500
    })

    // 延迟跳回主页
    setTimeout(() => {
      console.log('[Onboarding] Switching to wishes tab')
      wx.switchTab({
        url: '/pages/wishes/wishes',
        fail: (err) => {
          console.error('[Onboarding] switchTab failed', err)
          // 备用方案
          wx.reLaunch({ url: '/pages/wishes/wishes' })
        }
      })
    }, 1500)
  },

  // 切换至家长视角
  onSwitchToParent() {
    this.setData({
      showPasswordDialog: true,
      password: ''
    })
  },

  // 关闭密码对话框
  onClosePasswordDialog() {
    this.setData({
      showPasswordDialog: false,
      password: ''
    })
  },

  // 按键输入
  onKeyPress(e) {
    const key = e.currentTarget.dataset.key
    let { password } = this.data

    if (password.length < 4) {
      password += key
      this.setData({ password })

      // 如果输入满4位，自动验证
      if (password.length === 4) {
        this.verifyPassword(password)
      }
    }
  },

  // 删除按键
  onDeleteKey() {
    let { password } = this.data
    if (password.length > 0) {
      password = password.slice(0, -1)
      this.setData({ password })
    }
  },

  // 验证密码
  async verifyPassword(password) {
    await app.ensureReady()
    const userId = app.globalData.userInfo?._id || app.globalData.userInfo?.id
    try {
      await api.verifyParentPassword(userId, password)

      app.switchToParentMode()
      this.setData({
        showPasswordDialog: false,
        password: '',
        isParentMode: true
      })

      wx.showToast({
        title: '欢迎回来',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/parent/home/home'
        })
      }, 1500)
    } catch (e) {
      console.error('验证密码失败', e)
      wx.showToast({
        title: e?.message || '验证失败',
        icon: 'none'
      })
      this.setData({ password: '' })
    }
  },

  // 退出家长视角
  onExitParentMode() {
    wx.showModal({
      title: '退出家长视角',
      content: '确定要退出家长模式吗？',
      success: (res) => {
        if (res.confirm) {
          app.exitParentMode()
          this.setData({
            isParentMode: false
          })

          wx.showToast({
            title: '已退出',
            icon: 'success'
          })

          // 跳转到小朋友首页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1000)
        }
      }
    })
  },

  // 关于
  onAbout() {
    wx.showModal({
      title: '关于小红花',
      content: '小红花是一个帮助孩子养成好习惯的小工具。\n\n通过完成任务获得小红花，兑换心仪的奖励。\n\n让习惯养成更有趣！',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 自定义底部导航
  onNavigateTab(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    wx.reLaunch({ url: path })
  }
})
