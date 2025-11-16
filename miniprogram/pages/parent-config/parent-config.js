const mockApi = require('../../utils/mockApi')

Page({
  data: {
    config: {
      weeklyAmount: 10,
      dayOfWeek: 1,
      time: '09:00',
      enabled: false
    }
  },

  onLoad() {
    this.loadConfig()
  },

  async loadConfig() {
    try {
      const res = await mockApi.getWeeklyConfig()
      if (res.success) {
        this.setData({
          config: res.data
        })
      }
    } catch (e) {
      console.error('加载配置失败', e)
    }
  },

  onAmountChange(e) {
    this.setData({
      'config.weeklyAmount': e.detail
    })
  },

  onEnableChange(e) {
    this.setData({
      'config.enabled': e.detail.value
    })
  },

  async onSave() {
    try {
      const res = await mockApi.updateWeeklyConfig(this.data.config)
      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      }
    } catch (e) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})

