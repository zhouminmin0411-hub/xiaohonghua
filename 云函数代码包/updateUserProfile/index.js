// 云函数：updateUserProfile - 更新用户资料
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { nickname, avatarUrl, avatar_url } = event || {}
  const { OPENID } = cloud.getWXContext()

  if (!OPENID) {
    return {
      code: 401,
      message: '未登录'
    }
  }

  const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  const user = data && data.length > 0 ? data[0] : null

  if (!user) {
    return {
      code: 404,
      message: '未找到用户'
    }
  }

  const updateData = {}
  if (typeof nickname === 'string' && nickname.trim()) {
    updateData.nickname = nickname.trim()
  }

  const nextAvatarUrl = avatarUrl || avatar_url
  if (typeof nextAvatarUrl === 'string' && nextAvatarUrl.trim()) {
    updateData.avatar_url = nextAvatarUrl.trim()
  }

  if (Object.keys(updateData).length === 0) {
    return {
      code: 400,
      message: '缺少更新内容'
    }
  }

  updateData.updated_at = db.serverDate()

  await db.collection('users').doc(user._id).update({
    data: updateData
  })

  const { data: updatedUser } = await db.collection('users').doc(user._id).get()

  return {
    code: 200,
    message: '更新成功',
    data: updatedUser
  }
}
