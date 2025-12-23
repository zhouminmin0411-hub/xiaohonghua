// pages/parent/weekly/weekly.js
const api = require("../../utils/cloudApi")')
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
    lastSentAtText: '',
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
      
      // 格式化上次发放时间
      let lastSentAtText = ''
      if (result.lastSentAt) {
        const date = new Date(result.lastSentAt)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        lastSentAtText = `${month}月${day}日 ${hour}:${minute < 10 ? '0' + minute : minute}`
      }
      
      this.setData({
        config: result,
        timeValue: result.time,
        lastSentAtText
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
      const result = await api.updateWeeklyConfig(childId, config)
      
      // 更新本地数据，显示最新配置
      this.setData({
        config: result
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 延迟重新加载，确保显示最新状态
      setTimeout(() => {
        this.loadConfig()
      }, 1000)
    } catch (e) {
      console.error('保存配置失败', e)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }
})
