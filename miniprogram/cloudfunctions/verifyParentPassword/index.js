// 云函数：verifyParentPassword - 校验/设置家长密码
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { password } = event || {}

  if (!password) {
    return {
      code: 400,
      message: '缺少必要参数'
    }
  }

  const users = db.collection('users')
  const { OPENID } = cloud.getWXContext()
  const { data } = await users.where({ openid: OPENID }).limit(1).get()
  const user = data && data.length > 0 ? data[0] : null

  if (!user) {
    return {
      code: 404,
      message: '未找到用户'
    }
  }

  const docToUpdate = user._id

  // 首次设置：若未设置过家长密码，则直接写入并通过
  if (!user.parent_password) {
    try {
      await users.doc(docToUpdate).update({
        data: {
          parent_password: password,
          updated_at: db.serverDate()
        }
      })
    } catch (err) {
      console.error('设置家长密码失败', err)
      return {
        code: 500,
        message: '设置家长密码失败',
        error: err.message
      }
    }

    return {
      code: 200,
      message: '密码已设置并验证通过',
      data: {
        verified: true,
        firstSet: true
      }
    }
  }

  // 校验已存在的密码
  if (user.parent_password === password) {
    return {
      code: 200,
      message: '验证成功',
      data: { verified: true }
    }
  }

  return {
    code: 401,
    message: '密码错误',
    data: { verified: false }
  }
}
