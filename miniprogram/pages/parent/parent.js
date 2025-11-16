// 家长首页
const mockApi = require('../../utils/mockApi')
const app = getApp()

Page({
  data: {
    weeklyCompleted: 0,
    currentPoints: 0,
    records: [],
    showAdjustDialog: false,
    adjustAmount: '',
    adjustReason: ''
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 确保是家长模式
    if (!app.globalData.isParentMode) {
      wx.showToast({
        title: '请先切换至家长视角',
        icon: 'none'
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/settings/settings'
        })
      }, 1500)
      return
    }

    this.loadData()
  },

  // 加载数据
  async loadData() {
    this.loadRecords()
    this.setData({
      currentPoints: app.globalData.currentPoints
    })
  },

  // 加载任务记录
  async loadRecords() {
    try {
      const res = await mockApi.getTaskRecords()
      if (res.success) {
        // 计算本周完成数
        const now = new Date()
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        
        const weeklyCompleted = res.data.filter(record => {
          const completedDate = new Date(record.completedAt)
          return completedDate >= weekStart
        }).length

        // 格式化时间
        const formattedRecords = res.data.map(record => ({
          ...record,
          completedAt: this.formatTime(record.completedAt)
        }))

        this.setData({
          records: formattedRecords.slice(0, 10), // 只显示最近10条
          weeklyCompleted
        })
      }
    } catch (e) {
      console.error('加载记录失败', e)
    }
  },

  // 格式化时间
  formatTime(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}小时前`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}天前`

    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  // 导航到其他页面
  onNavigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  // 显示积分调整对话框
  onShowAdjustDialog() {
    this.setData({
      showAdjustDialog: true,
      adjustAmount: '',
      adjustReason: ''
    })
  },

  // 关闭对话框
  onAdjustDialogClose() {
    this.setData({
      showAdjustDialog: false
    })
  },

  // 调整数值变化
  onAdjustAmountChange(e) {
    this.setData({
      adjustAmount: e.detail
    })
  },

  // 调整原因变化
  onAdjustReasonChange(e) {
    this.setData({
      adjustReason: e.detail
    })
  },

  // 确认积分调整
  async onConfirmAdjust() {
    const { adjustAmount, adjustReason } = this.data

    if (!adjustAmount) {
      wx.showToast({
        title: '请输入调整数值',
        icon: 'none'
      })
      return
    }

    const amount = parseInt(adjustAmount)
    if (isNaN(amount)) {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      })
      return
    }

    try {
      const res = await mockApi.adjustPoints(amount, adjustReason || '家长积分调整')

      if (res.success) {
        this.setData({
          currentPoints: res.data.currentPoints,
          showAdjustDialog: false
        })

        wx.showToast({
          title: '调整成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    } catch (e) {
      console.error('积分调整失败', e)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 点赞任务
  async onLikeTask(e) {
    const recordId = e.currentTarget.dataset.id

    try {
      const res = await mockApi.likeTask(recordId)

      if (res.success) {
        wx.showToast({
          title: '点赞成功！',
          icon: 'success'
        })

        // 刷新列表
        this.loadRecords()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    } catch (e) {
      console.error('点赞失败', e)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
  }
})
