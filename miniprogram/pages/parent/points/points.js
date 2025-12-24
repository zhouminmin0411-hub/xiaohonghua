// pages/parent/points/points.js
const api = require('../../../utils/cloudApi')
const dateUtil = require('../../../utils/date')
const app = getApp()

Page({
  data: {
    currentPoints: 0,
    adjustAmount: '',
    adjustReason: '',
    history: []
  },

  onLoad() {
    this.loadCurrentPoints()
    this.loadHistory()
  },

  onShow() {
    this.loadCurrentPoints()
    this.loadHistory()
  },

  async loadCurrentPoints() {
    await app.ensureReady()
    const childId = app.globalData.childId
    if (!childId) {
      return
    }
    const points = await app.refreshPoints()
    this.setData({
      currentPoints: points
    })
  },

  async loadHistory() {
    await app.ensureReady()
    const childId = app.globalData.childId
    if (!childId) {
      return
    }
    try {
      const result = await api.getPointHistory(childId)
      const adjustmentHistory = result
        .sort((a, b) => dateUtil.getTimestamp(b.createdAt || b.updatedAt) - dateUtil.getTimestamp(a.createdAt || a.updatedAt))
        .filter(item => item.sourceType === 'adjustment')
        .map(item => ({
          ...item,
          time: this.formatTime(item.createdAt)
        }))
        .slice(0, 20)

      this.setData({
        history: adjustmentHistory
      })
    } catch (e) {
      console.error('加载历史失败', e)
    }
  },

  formatTime(isoString) {
    const date = dateUtil.parseDateTime(isoString)
    if (!date) return ''
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${month}月${day}日 ${hour}:${minute < 10 ? '0' + minute : minute}`
  },

  onAmountChange(e) {
    this.setData({
      adjustAmount: e.detail
    })
  },

  onReasonChange(e) {
    this.setData({
      adjustReason: e.detail
    })
  },

  quickAdjust(e) {
    const amount = parseInt(e.currentTarget.dataset.amount)
    this.setData({
      adjustAmount: amount.toString()
    })
  },

  async submitAdjustment() {
    const { adjustAmount, adjustReason } = this.data

    if (!adjustAmount) {
      wx.showToast({
        title: '请输入调整数量',
        icon: 'none'
      })
      return
    }

    const amount = parseInt(adjustAmount)
    if (isNaN(amount) || amount === 0) {
      wx.showToast({
        title: '请输入有效的调整数量',
        icon: 'none'
      })
      return
    }

    // 检查是否会导致负积分
    if (app.globalData.currentPoints + amount < 0) {
      wx.showToast({
        title: '调整后积分不能为负数',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认调整',
      content: `将${amount > 0 ? '增加' : '扣减'}${Math.abs(amount)}个小红花`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const childId = app.globalData.childId
            await api.adjustPoints(
              childId,
              amount,
              adjustReason || `家长积分调整：${amount > 0 ? '+' : ''}${amount}`
            )

            wx.showToast({
              title: '调整成功',
              icon: 'success'
            })

            // 重置表单
            this.setData({
              adjustAmount: '',
              adjustReason: ''
            })

            // 刷新数据
            this.loadCurrentPoints()
            this.loadHistory()
          } catch (e) {
            wx.showToast({
              title: '调整失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})
