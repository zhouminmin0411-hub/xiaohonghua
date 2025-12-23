// pages/parent/tasks/tasks.js
const api = require("../../utils/cloudApi")')
const app = getApp()

Page({
  data: {
    tasks: [],
    showPopup: false,
    showTypePopup: false,
    editingTask: null,
    formData: {
      icon: '📝',
      title: '',
      description: '',
      type: 'daily',
      reward: 3
    },
    taskTypeMap: {
      daily: '每日任务',
      challenge: '挑战任务',
      housework: '家务任务'
    },
    typeColumns: [
      { text: '每日任务', value: 'daily' },
      { text: '挑战任务', value: 'challenge' },
      { text: '家务任务', value: 'housework' }
    ]
  },

  async onLoad() {
    await app.ensureReady()
    this.loadTasks()
  },

  async onShow() {
    await app.ensureReady()
    this.loadTasks()
  },

  async loadTasks() {
    try {
      await app.ensureReady()
      const tasks = await api.getTasks()
      this.setData({ tasks })
    } catch (error) {
      console.error('加载任务失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  showAddTask() {
    this.setData({
      editingTask: null,
      formData: {
        icon: '📝',
        title: '',
        description: '',
        type: 'daily',
        reward: 3
      },
      showPopup: true
    })
  },

  editTask(e) {
    const task = e.currentTarget.dataset.task
    this.setData({
      editingTask: task,
      formData: {
        icon: task.icon || '📝',
        title: task.title,
        description: task.description || '',
        type: task.type,
        reward: task.reward
      },
      showPopup: true
    })
  },

  deleteTask(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '删除后任务将不再显示在孩子端',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.deleteTask(id)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.loadTasks()
        } catch (error) {
          console.error('删除任务失败', error)
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
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

  onDescriptionChange(e) {
    this.setData({
      'formData.description': e.detail
    })
  },

  onRewardChange(e) {
    this.setData({
      'formData.reward': parseInt(e.detail, 10) || 0
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

  async submitTask() {
    const { formData, editingTask } = this.data

    if (!formData.title) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none'
      })
      return
    }

    if (!formData.reward || formData.reward < 0) {
      wx.showToast({
        title: '请输入有效的奖励积分',
        icon: 'none'
      })
      return
    }

    try {
      await app.ensureReady()
      const payload = {
        ...formData,
        createdByParentId: app.globalData.parentUserId || app.globalData.userInfo?.id || null
      }

      if (editingTask) {
        await api.updateTask(editingTask.id, payload)
      } else {
        await api.createTask(payload)
      }

      wx.showToast({
        title: editingTask ? '保存成功' : '创建成功',
        icon: 'success'
      })
      this.hidePopup()
      this.loadTasks()
    } catch (error) {
      console.error('保存任务失败', error)
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
