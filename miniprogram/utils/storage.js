// 本地存储工具函数

// 设置数据
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('存储失败', e)
    return false
  }
}

// 获取数据
function getStorage(key) {
  try {
    const value = wx.getStorageSync(key)
    return value ? JSON.parse(value) : null
  } catch (e) {
    console.error('读取失败', e)
    return null
  }
}

// 删除数据
function removeStorage(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除失败', e)
    return false
  }
}

// 清空所有数据
function clearStorage() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('清空失败', e)
    return false
  }
}

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage
}

