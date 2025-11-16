// pages/parent/tasks/tasks.js
const mockApi = require('../../../utils/mockApi')

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
      'daily': '每日任务',
      'challenge': '挑战任务',
      'homework': '家务任务'
    },
    typeColumns: [
      { text: '每日任务', value: 'daily' },
      { text: '挑战任务', value: 'challenge' },
      { text: '家务任务', value: 'homework' }
    ]
  },

  onLoad() {
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  // 加载任务列表
  async loadTasks() {
    try {
      const result = await mockApi.getTasks()
      if (result.success) {
        // 显示所有任务，包括自定义任务
        const customTasks = wx.getStorageSync('customTasks') || []
        const allTasks = [...result.data, ...customTasks]
        this.setData({
          tasks: allTasks
        })
      }
    } catch (e) {
      console.error('加载任务失败', e)
    }
  },

  // 显示新建任务弹窗
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

  // 编辑任务
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

  // 删除任务
  deleteTask(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '删除后任务将不再显示在孩子端',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await mockApi.deleteTask(id)
            if (result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadTasks()
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

  // 表单字段变化
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
      'formData.reward': parseInt(e.detail) || 0
    })
  },

  // 显示类型选择器
  showTypePicker() {
    this.setData({
      showTypePopup: true
    })
  },

  // 类型选择确认
  onTypeConfirm(e) {
    this.setData({
      'formData.type': e.detail.value.value,
      showTypePopup: false
    })
  },

  // 类型选择取消
  onTypeCancel() {
    this.setData({
      showTypePopup: false
    })
  },

  // 提交任务
  async submitTask() {
    const { formData, editingTask } = this.data

    // 验证
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
      let result
      if (editingTask) {
        // 更新任务
        result = await mockApi.updateTask(editingTask.id, formData)
      } else {
        // 创建任务
        result = await mockApi.createTask(formData)
      }

      if (result.success) {
        wx.showToast({
          title: editingTask ? '保存成功' : '创建成功',
          icon: 'success'
        })
        this.hidePopup()
        this.loadTasks()
      }
    } catch (e) {
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },

  // 隐藏弹窗
  hidePopup() {
    this.setData({
      showPopup: false
    })
  }
})
