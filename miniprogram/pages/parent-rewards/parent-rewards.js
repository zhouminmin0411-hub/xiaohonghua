const mockApi = require('../../utils/mockApi')

Page({
  data: {
    rewards: []
  },

  onLoad() {
    this.loadRewards()
  },

  async loadRewards() {
    try {
      const res = await mockApi.getRewards()
      if (res.success) {
        this.setData({
          rewards: res.data
        })
      }
    } catch (e) {
      console.error('加载奖励失败', e)
    }
  }
})

