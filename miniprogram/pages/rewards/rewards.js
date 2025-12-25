// 积分商城页面
const api = require('../../utils/cloudApi')
const animationUtil = require('../../utils/animation')
const app = getApp()

Page({
  data: {
    currentPoints: 0,
    rewards: [],
    loading: false,
    showParticles: false,
    canvasWidth: 375,
    canvasHeight: 667
  },

  async onLoad() {
    await app.ensureReady()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    this.loadRewards()

    // 获取屏幕尺寸
    const systemInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    this.setData({
      canvasWidth: systemInfo.windowWidth,
      canvasHeight: systemInfo.windowHeight
    })
  },

  async onShow() {
    await app.ensureReady()
    // 每次显示时更新积分
    this.setData({
      currentPoints: app.globalData.currentPoints
    })

    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onHide() {
    this.clearParticleTimer()
  },

  onUnload() {
    this.clearParticleTimer()
  },

  // 加载奖励列表
  async loadRewards() {
    await app.ensureReady()
    this.setData({ loading: true })

    try {
      const rewards = await api.getRewards()
      this.setData({
        rewards,
        loading: false
      })
    } catch (e) {
      console.error('加载奖励失败', e)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 兑换奖励
  async onRedeemReward(e) {
    const id = Number(e.currentTarget.dataset.id)
    const title = e.currentTarget.dataset.title
    const cost = Number(e.currentTarget.dataset.cost)
    const childId = app.globalData.childId

    if (!childId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    if (this.data.currentPoints < cost) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }

    // 确认对话框
    const confirmRes = await wx.showModal({
      title: '确认兑换',
      content: `兑换"${title}"需要消耗${cost}个小红花，确定吗？`,
      confirmText: '确定兑换',
      cancelText: '再想想'
    })

    if (!confirmRes.confirm) {
      return
    }

    // 震动反馈
    animationUtil.vibrate('medium')

    try {
      await api.redeemReward(childId, id)
      const points = await app.refreshPoints()
      this.setData({
        currentPoints: points
      })

      // 播放粒子爆炸动画
      this.playParticleAnimation()

      wx.showToast({
        title: '兑换成功！',
        icon: 'success',
        duration: 2000
      })

      // 刷新奖励列表
      setTimeout(() => {
        this.loadRewards()
      }, 500)
    } catch (e) {
      console.error('兑换奖励失败', e)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 播放粒子爆炸动画
  playParticleAnimation() {
    this.setData({ showParticles: true })

    const ctx = wx.createCanvasContext('particleCanvas')
    const { canvasWidth, canvasHeight } = this.data
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // 创建粒子
    const particles = []
    const particleCount = 30
    const colors = ['#FF5A5A', '#FFB84D', '#4CAF50', '#2196F3', '#9C27B0']

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const velocity = 3 + Math.random() * 3

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        life: 1.0
      })
    }

    // 动画循环
    let frame = 0
    const maxFrames = 30

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2 // 重力
        p.life -= 1 / maxFrames

        if (p.life > 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.life
          ctx.fill()
        }
      })

      ctx.draw()

      frame++
      if (frame < maxFrames) {
        this.particleTimer = setTimeout(animate, 16)
      } else {
        this.clearParticleTimer()
        this.setData({ showParticles: false })
      }
    }

    animate()
  },

  clearParticleTimer() {
    if (this.particleTimer) {
      clearTimeout(this.particleTimer)
      this.particleTimer = null
    }
  },

  // 自定义底部导航
  onNavigateTab(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    wx.reLaunch({ url: path })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await app.refreshPoints()
    await this.loadRewards()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
    wx.stopPullDownRefresh()
  }
})
