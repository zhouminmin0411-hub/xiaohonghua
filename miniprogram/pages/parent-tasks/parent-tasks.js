// 家长任务管理页面
const mockApi = require('../../utils/mockApi')

Page({
  data: {
    tasks: [],
    taskTypeMap: {
      'daily': '每日任务',
      'challenge': '挑战任务',
      'chore': '家务任务'
    }
  },

  onLoad() {
    this.loadTasks()
  },

  async loadTasks() {
    try {
      const res = await mockApi.getTasks()
      if (res.success) {
        this.setData({
          tasks: res.data
        })
      }
    } catch (e) {
      console.error('加载任务失败', e)
    }
  },

  onAddTask() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    })
  },

  onEditTask(e) {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    })
  },

  async onDeleteTask(e) {
    const taskId = e.currentTarget.dataset.id
    
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？'
    })

    if (res.confirm) {
      try {
        const result = await mockApi.deleteTask(taskId)
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
          icon: 'none'
        })
      }
    }
  }
})

