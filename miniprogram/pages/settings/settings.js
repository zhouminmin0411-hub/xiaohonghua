// 设置页面
const api = require('../../utils/realApi')
const app = getApp()

Page({
  data: {
    userInfo: {
      nickname: '小明',
      avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
    },
    isParentMode: false,
    showPasswordDialog: false,
    password: ''
  },

  async onLoad() {
    await app.ensureReady()
    this.loadUserInfo()
    this.setData({
      isParentMode: app.globalData.isParentMode
    })
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
      this.setData({
        userInfo
      })
      return
    }

    try {
      const cached = wx.getStorageSync('userInfo')
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        this.setData({
          userInfo: parsed
        })
      }
    } catch (e) {
      console.error('加载用户信息失败', e)
    }
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
    const userId = app.globalData.parentUserId || app.globalData.userInfo?.id || 2
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
