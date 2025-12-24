// 云函数：likeTask - 点赞任务
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'cloud1-6gmt7m654faa5008'
})

const db = cloud.database()

exports.main = async (event, context) => {
    const { recordId } = event

    if (!recordId) {
        return { code: 400, message: '缺少 recordId' }
    }

    try {
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
