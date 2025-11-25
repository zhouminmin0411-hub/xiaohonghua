// pages/parent/weekly/weekly.js
const api = require('../../../utils/realApi')
const app = getApp()

Page({
  data: {
    config: {
      weeklyAmount: 10,
      dayOfWeek: 1,
      time: '09:00',
      enabled: false
    },
    showDayPopup: false,
    showTimePopup: false,
    timeValue: '09:00',
    weekDayMap: {
      1: '周一',
      2: '周二',
      3: '周三',
      4: '周四',
      5: '周五',
      6: '周六',
      7: '周日'
    },
    dayColumns: [
      { text: '周一', value: 1 },
      { text: '周二', value: 2 },
      { text: '周三', value: 3 },
      { text: '周四', value: 4 },
      { text: '周五', value: 5 },
      { text: '周六', value: 6 },
      { text: '周日', value: 7 }
    ]
  },

  async onLoad() {
    await app.ensureReady()
    this.loadConfig()
  },

  async loadConfig() {
    const childId = app.globalData.childId
    if (!childId) {
      return
    }
    try {
      const result = await api.getWeeklyConfig(childId)
      this.setData({
        config: result,
        timeValue: result.time
      })
    } catch (e) {
      console.error('加载配置失败', e)
    }
  },

  onAmountChange(e) {
    this.setData({
      'config.weeklyAmount': parseInt(e.detail) || 0
    })
  },

  onSwitchChange(e) {
    this.setData({
      'config.enabled': e.detail
    })
  },

  showDayPicker() {
    this.setData({
      showDayPopup: true
    })
  },

  onDayConfirm(e) {
    this.setData({
      'config.dayOfWeek': e.detail.value.value,
      showDayPopup: false
    })
  },

  onDayCancel() {
    this.setData({
      showDayPopup: false
    })
  },

  showTimePicker() {
    this.setData({
      showTimePopup: true
    })
  },

  onTimeConfirm(e) {
    this.setData({
      'config.time': e.detail,
      timeValue: e.detail,
      showTimePopup: false
    })
  },

  onTimeCancel() {
    this.setData({
      showTimePopup: false
    })
  },

  async saveConfig() {
    const { config } = this.data

    if (!config.weeklyAmount || config.weeklyAmount < 0) {
      wx.showToast({
        title: '请输入有效的积分数',
        icon: 'none'
      })
      return
    }

    try {
      const childId = app.globalData.childId
      await api.updateWeeklyConfig(childId, config)
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (e) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }
})
