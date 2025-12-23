// 云函数：login - 用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 查询用户是否存在
    const userCollection = db.collection('users')
    const { data: users } = await userCollection.where({
      openid: openid
    }).get()
    
    if (users.length > 0) {
      // 用户已存在，返回用户信息
      return {
        code: 200,
        message: '登录成功',
        data: users[0]
      }
    } else {
      // 新用户，创建用户记录
      const result = await userCollection.add({
        data: {
          openid: openid,
          role: 'child',
          nickname: '小红花宝宝',
          avatar_url: '',
          parent_password: null,
          child_id: null,
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        }
      })
      
      // 获取新创建的用户信息
      const { data: newUser } = await userCollection.doc(result._id).get()
      
      return {
        code: 200,
        message: '登录成功',
        data: newUser
      }
    }
  } catch (error) {
    console.error('登录失败', error)
    return {
      code: 500,
      message: '登录失败',
      error: error.message
    }
  }
}

