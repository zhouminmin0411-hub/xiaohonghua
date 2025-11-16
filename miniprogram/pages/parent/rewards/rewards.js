// pages/parent/rewards/rewards.js
const mockApi = require('../../../utils/mockApi')

Page({
  data: {
    rewards: [],
    showPopup: false,
    showTypePopup: false,
    editingReward: null,
    formData: {
      icon: '🎁',
      title: '',
      type: 'virtual',
      cost: 5
    },
    rewardTypeMap: {
      'virtual': '虚拟奖励',
      'real': '实物奖励'
    },
    typeColumns: [
      { text: '虚拟奖励', value: 'virtual' },
      { text: '实物奖励', value: 'real' }
    ]
  },

  onLoad() {
    this.loadRewards()
  },

  onShow() {
    this.loadRewards()
  },

  async loadRewards() {
    try {
      const result = await mockApi.getRewards()
      if (result.success) {
        const customRewards = wx.getStorageSync('customRewards') || []
        const allRewards = [...result.data, ...customRewards]
        this.setData({
          rewards: allRewards
        })
      }
    } catch (e) {
      console.error('加载奖励失败', e)
    }
  },

  showAddReward() {
    this.setData({
      editingReward: null,
      formData: {
        icon: '🎁',
        title: '',
        type: 'virtual',
        cost: 5
      },
      showPopup: true
    })
  },

  editReward(e) {
    const reward = e.currentTarget.dataset.reward
    this.setData({
      editingReward: reward,
      formData: {
        icon: reward.icon || '🎁',
        title: reward.title,
        type: reward.type,
        cost: reward.cost
      },
      showPopup: true
    })
  },

  deleteReward(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '删除后奖励将不再显示在孩子端',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await mockApi.deleteReward(id)
            if (result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadRewards()
            }
          } catch (e) {
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  onIconChange(e) {
    this.setData({
      'formData.icon': e.detail
    })
  },

  onTitleChange(e) {
    this.setData({
      'formData.title': e.detail
    })
  },

  onCostChange(e) {
    this.setData({
      'formData.cost': parseInt(e.detail) || 0
    })
  },

  showTypePicker() {
    this.setData({
      showTypePopup: true
    })
  },

  onTypeConfirm(e) {
    this.setData({
      'formData.type': e.detail.value.value,
      showTypePopup: false
    })
  },

  onTypeCancel() {
    this.setData({
      showTypePopup: false
    })
  },

  async submitReward() {
    const { formData, editingReward } = this.data

    if (!formData.title) {
      wx.showToast({
        title: '请输入奖励名称',
        icon: 'none'
      })
      return
    }

    if (!formData.cost || formData.cost < 0) {
      wx.showToast({
        title: '请输入有效的消耗积分',
        icon: 'none'
      })
      return
    }

    try {
      let result
      if (editingReward) {
        result = await mockApi.updateReward(editingReward.id, formData)
      } else {
        result = await mockApi.createReward(formData)
      }

      if (result.success) {
        wx.showToast({
          title: editingReward ? '保存成功' : '创建成功',
          icon: 'success'
        })
        this.hidePopup()
        this.loadRewards()
      }
    } catch (e) {
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },

  hidePopup() {
    this.setData({
      showPopup: false
    })
  }
})
