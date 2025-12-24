// pages/parent/tasks/tasks.js
const api = require('../../../utils/cloudApi')
const app = getApp()

Page({
  data: {
    tasks: [],
    showPopup: false,
    editingTask: null,
    formData: {
      icon: '📝',
      title: '',
      description: '',
      type: 'daily',
      reward: 3
    },
    showTypePicker: false,
    typeIndex: 0,
    tempTypeIndex: 0,
    submitting: false,
    deletingId: null,
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
      const normalizedTasks = (tasks || []).map((task) => ({
        ...task,
        id: task.id || task._id,
        isActive: task.isActive ?? task.is_active ?? true
      }))
      this.setData({ tasks: normalizedTasks })
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
      showTypePicker: false,
      typeIndex: 0,
      tempTypeIndex: 0,
      showPopup: true
    })
  },

  editTask(e) {
    const task = e.currentTarget.dataset.task
    const typeIndex = this.getTypeIndex(task.type)
    this.setData({
      editingTask: task,
      formData: {
        icon: task.icon || '📝',
        title: task.title,
        description: task.description || '',
        type: task.type,
        reward: task.reward
      },
      showTypePicker: false,
      typeIndex,
      tempTypeIndex: typeIndex,
      showPopup: true
    })
  },

  deleteTask(e) {
    const { id } = e.currentTarget.dataset
    if (!id) {
      wx.showToast({
        title: '未找到任务ID',
        icon: 'none'
      })
      return
    }

    if (this.data.deletingId) {
      return
    }
    wx.showModal({
      title: '确认删除',
      content: '删除后任务将不再显示在孩子端',
      success: async (res) => {
        if (!res.confirm) return
        try {
          this.setData({ deletingId: id })
          const result = await api.deleteTask(id)
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
          this.loadTasks()
        } catch (error) {
          console.error('删除任务失败', error)
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        } finally {
          this.setData({ deletingId: null })
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
    const type = this.data.typeColumns[index]?.value || 'daily'
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

  async submitTask() {
    const { formData, editingTask } = this.data
    if (this.data.submitting) {
      return
    }

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
      this.setData({ submitting: true })
      const payload = {
        ...formData,
        createdByParentId: app.globalData.parentUserId || app.globalData.userInfo?._id || app.globalData.userInfo?.id || null
      }

      if (editingTask) {
        const result = await api.updateTask(editingTask.id, payload)
        if (result === null) {
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          })
          return
        }
      } else {
        const result = await api.createTask(payload)
        if (result === null) {
          wx.showToast({
            title: '创建失败',
            icon: 'error'
          })
          return
        }
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
