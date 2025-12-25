// pages/parent/rewards/rewards.js
const api = require('../../../utils/cloudApi')
const app = getApp()

Page({
  data: {
    rewards: [],
    showPopup: false,
    editingReward: null,
    formData: {
      icon: '🎁',
      title: '',
      type: 'virtual',
      cost: 5
    },
    showTypePicker: false,
    typeIndex: 0,
    tempTypeIndex: 0,
    submitting: false,
    deletingId: null,
    rewardTypeMap: {
      'virtual': '虚拟奖励',
      'physical': '实物奖励'
    },
    typeColumns: [
      { text: '虚拟奖励', value: 'virtual' },
      { text: '实物奖励', value: 'physical' }
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
      const rewards = await api.getRewards()
      const normalizedRewards = (rewards || []).map((reward) => ({
        ...reward,
        id: reward.id || reward._id
      }))
      this.setData({
        rewards: normalizedRewards
      })
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
      showTypePicker: false,
      typeIndex: 0,
      tempTypeIndex: 0,
      showPopup: true
    })
  },

  editReward(e) {
    const reward = e.currentTarget.dataset.reward
    const typeIndex = this.getTypeIndex(reward.type)
    this.setData({
      editingReward: reward,
      formData: {
        icon: reward.icon || '🎁',
        title: reward.title,
        type: reward.type,
        cost: reward.cost
      },
      showTypePicker: false,
      typeIndex,
      tempTypeIndex: typeIndex,
      showPopup: true
    })
  },

  deleteReward(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      wx.showToast({
        title: '未找到奖励ID',
        icon: 'none'
      })
      return
    }

    if (this.data.deletingId) {
      return
    }
    wx.showModal({
      title: '确认删除',
      content: '删除后奖励将不再显示在孩子端',
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ deletingId: id })
            const result = await api.deleteReward(id)
            if (result === null) {
              wx.showToast({
                title: '删除失败',
                icon: 'error'
              })
              return
            }
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadRewards()
          } catch (e) {
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          } finally {
            this.setData({ deletingId: null })
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
      showTypePicker: true,
      tempTypeIndex: this.data.typeIndex
    })
  },

  onTypePickerChange(e) {
    const index = Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value
    this.setData({
      tempTypeIndex: Number(index) || 0
    })
  },

  onTypeConfirm() {
    const index = this.data.tempTypeIndex || 0
    const type = this.data.typeColumns[index]?.value || 'virtual'
    this.setData({
      'formData.type': type,
      typeIndex: index,
      showTypePicker: false
    })
  },

  onTypeCancel() {
    this.setData({
      showTypePicker: false,
      tempTypeIndex: this.data.typeIndex
    })
  },

  getTypeIndex(type) {
    const index = this.data.typeColumns.findIndex((item) => item.value === type)
    return index === -1 ? 0 : index
  },

  noop() {},

  async submitReward() {
    const { formData, editingReward } = this.data
    if (this.data.submitting) {
      return
    }

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
      this.setData({ submitting: true })
      const payload = {
        ...formData,
        createdByParentId: app.globalData.userInfo?._id || app.globalData.userInfo?.id || null
      }

      if (editingReward) {
        const result = await api.updateReward(editingReward.id, payload)
        if (result === null) {
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          })
          return
        }
      } else {
        const result = await api.createReward(payload)
        if (result === null) {
          wx.showToast({
            title: '创建失败',
            icon: 'error'
          })
          return
        }
      }

      wx.showToast({
        title: editingReward ? '保存成功' : '创建成功',
        icon: 'success'
      })
      this.hidePopup()
      this.loadRewards()
    } catch (e) {
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  hidePopup() {
    this.setData({
      showPopup: false,
      showTypePicker: false,
      submitting: false
    })
  }
})
