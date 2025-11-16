// 动画工具函数

// 小红花飞入动画
function createFlowerFlyAnimation(startX, startY, endX, endY) {
  const animation = wx.createAnimation({
    duration: 600,
    timingFunction: 'ease-out'
  })
  
  // 计算路径
  const deltaX = endX - startX
  const deltaY = endY - startY
  
  // 贝塞尔曲线路径
  animation
    .translate(deltaX, deltaY)
    .scale(0.5)
    .opacity(0)
    .step()
  
  return animation.export()
}

// 按钮点击动画
function createButtonClickAnimation() {
  const animation = wx.createAnimation({
    duration: 120,
    timingFunction: 'ease-in-out'
  })
  
  animation
    .scale(0.96)
    .step({duration: 60})
    .scale(1)
    .step({duration: 60})
  
  return animation.export()
}

// 任务完成闪光效果
function createFlashAnimation() {
  const animation = wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-in-out'
  })
  
  animation
    .opacity(0.6)
    .step({duration: 150})
    .opacity(0)
    .step({duration: 150})
  
  return animation.export()
}

// 淡入动画
function createFadeInAnimation() {
  const animation = wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-in'
  })
  
  animation
    .opacity(1)
    .translateY(0)
    .step()
  
  return animation.export()
}

// 缩放进入动画
function createScaleInAnimation() {
  const animation = wx.createAnimation({
    duration: 200,
    timingFunction: 'ease-out'
  })
  
  animation
    .scale(1)
    .opacity(1)
    .step()
  
  return animation.export()
}

// 震动反馈
function vibrate(type = 'light') {
  if (type === 'heavy') {
    wx.vibrateShort({type: 'heavy'})
  } else if (type === 'medium') {
    wx.vibrateShort({type: 'medium'})
  } else {
    wx.vibrateShort({type: 'light'})
  }
}

module.exports = {
  createFlowerFlyAnimation,
  createButtonClickAnimation,
  createFlashAnimation,
  createFadeInAnimation,
  createScaleInAnimation,
  vibrate
}

