// 云函数：likeTask - 点赞任务
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

async function getCurrentUser() {
    const { OPENID } = cloud.getWXContext()
    const { data } = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    return data && data.length > 0 ? data[0] : null
}

exports.main = async (event, context) => {
    const { recordId } = event

    if (!recordId) {
        return { code: 400, message: '缺少 recordId' }
    }

    try {
        const user = await getCurrentUser()
        if (!user) {
            return { code: 401, message: '未登录' }
        }

        const { data: record } = await db.collection('task_records').doc(recordId).get()
        if (!record) {
            return { code: 404, message: '任务记录不存在' }
        }
        if (record.child_id !== user._id) {
            return { code: 403, message: '无权操作该记录' }
        }

        await db.collection('task_records').doc(recordId).update({
            data: {
                parent_liked_at: db.serverDate(),
                updated_at: db.serverDate()
            }
        })

        return {
            code: 200,
            message: '点赞成功'
        }
    } catch (error) {
        console.error('点赞任务失败', error)
        return {
            code: 500,
            message: '点赞任务失败',
            error: error.message
        }
    }
}
