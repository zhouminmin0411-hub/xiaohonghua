const app = getApp()
const api = require('../../utils/cloudApi')
const dateUtil = require('../../utils/date')

const GREETING_MESSAGES = [
    '今天你很努力 💪',
    '小事也要认真 ✍️',
    '先做一步就好 👣',
    '做完心更轻松 🎈',
    '一点点也算赢 🌱',
    '不会没事，学就行 📚',
    '错了能改也很棒 ✅',
    '试过就很勇敢 🦁',
    '坚持一下就到啦 ⏳',
    '慢慢来也很好 🐢',
    '把心放平稳 🍀',
    '深呼吸一下 🌬️',
    '休息一下再来 🧸',
    '你能自己开始 🚀',
    '你会越来越会做 ⭐️',
    '今天比昨天好一点 📈',
    '你没有放弃 👍',
    '你在学新本事 🧠',
    '你能管住自己 🎯',
    '你很会坚持 🌟',
    '先把小目标完成 🎯',
    '做到就给自己赞 👍',
    '认真就会变好 ✨',
    '小努力会长大 🌼',
    '每天一小步 👣',
    '你在变更强 🔥',
    '你很会想办法 💡',
    '你会自己解决 🧩',
    '不怕难，继续做 💪',
    '不懂就问也棒 🙋',
    '今天学到一点点 📚',
    '今天更有耐心 🧸',
    '今天更会专心 🎯',
    '把东西放回家 🧺',
    '桌子更干净啦 🧼',
    '房间更整齐啦 🧽',
    '你会照顾自己 🧴',
    '你记得洗手啦 🧼',
    '你记得喝水啦 💧',
    '你记得早睡啦 🌙',
    '做事先想一想 🤔',
    '说话轻一点 🤍',
    '先听完再说 👂',
    '谢谢你真有礼 🎀',
    '你很会分享 🍓',
    '你很会等一等 🕰️',
    '你很会排队 🧍',
    '你很会守规则 ✅',
    '你很会守约 ⏰',
    '你很会守信 🤝',
    '你帮了别人真好 🤍',
    '你会说对不起 🙏',
    '你会说没关系 😊',
    '你会说谢谢你 🌷',
    '你会关心别人 🫶',
    '你会安慰别人 🧸',
    '你会控制脾气 🌤️',
    '生气时先停一下 🛑',
    '难过也能说出来 🗣️',
    '你的心很温暖 ☀️',
    '先把难的做完 🧗',
    '做完再去玩 🪁',
    '先收拾再休息 🧺',
    '先写一点点 ✍️',
    '先读一小页 📖',
    '先练五分钟 ⏱️',
    '先做好这一件 ✅',
    '先从简单开始 🧩',
    '先把心静下来 🍀',
    '自己的事情自己做 🖐️',
    '你今天没有拖拉 🏃',
    '你今天很守时 ⏰',
    '你今天很专注 🎯',
    '你今天很认真 ✍️',
    '你今天很自觉 🌟',
    '你今天很努力 💪',
    '你今天很有耐心 🧸',
    '你今天很会坚持 🌱',
    '你今天很会学习 📚',
    '你今天很会整理 🧺',
    '小错误不吓人 🐣',
    '下次会更好 🌈',
    '再练一次就熟了 🔁',
    '多练就会了 🏋️',
    '做慢一点也对 ✅',
    '做对了要记住 📌',
    '做错了也学到 📚',
    '你在变聪明 🧠✨',
    '你在变更稳 🧱',
    '你在变更勇敢 🦁',
    '你能把事做完 ✅',
    '你能把话说清 🗣️',
    '你能把心放好 🤍',
    '你能把手洗净 🧼',
    '你能把玩具收好 🧸',
    '你能把书放回去 📚',
    '你能把规则记住 ✅',
    '你能把自己照顾好 🌷',
    '小红花记得你 🌸',
    '继续向前走 👣✨'
]

Page({
    data: {
        userInfo: {},
        avatarDisplayUrl: '',
        showProfileAuth: false,
        profileNickname: '',
        currentPoints: 0,
        goalPoints: 20,
        history: [],
        loading: false,
        jarImage: '/assets/bottle_0.png',
        petalCloud: [],
        greetingMessage: '',
        showParentGuide: false
    },

    // 生成随机花瓣配置
    generatePetalCloud(count = 40) {
        const petals = []
        const maxDelay = 16  // 最大延迟16秒，让花瓣在16秒内陆续出现

        for (let i = 0; i < count; i++) {
            const startX = Math.random() * 800 - 50   // -50-750rpx 覆盖整个屏幕宽度(750rpx)并稍微超出
            const startY = Math.random() * 200   // -50-150rpx 从更高位置开始，部分在屏幕外
            // 水平位移：-100到+100rpx的漂移
            const horizontalDrift = (Math.random() - 0.5) * 200
            // 垂直位移：400-700rpx的更大绝对位移
            const verticalDrift = Math.random() * 300 + 300  // 300-600rpx
            const duration = Math.random() * 10 + 6  // 8-16秒
            // 随机延迟，让花瓣随机时间出现，而不是按顺序
            const delay = Math.random() * maxDelay  // 0-16秒随机延迟
            const scale = Math.random() * 0.5 + 0.85  // 0.85-1.35
            const rotation = Math.random() * 180 + 180  // 180-360度

            petals.push({
                startX: startX.toFixed(0),
                startY: startY.toFixed(0),
                horizontalDrift: horizontalDrift.toFixed(0),
                verticalDrift: verticalDrift.toFixed(0),
                duration: duration.toFixed(1),
                delay: delay.toFixed(1),
                scale: scale.toFixed(2),
                rotation: rotation.toFixed(0)
            })
        }
        return petals
    },

    onOpenSettings() {
        // 如果正在引导，点击头像后清除引导标记
        if (this.data.showParentGuide) {
            this.setData({ showParentGuide: false })
            wx.setStorageSync('showParentGuide', false)
        }
        wx.navigateTo({
            url: '/pages/settings/settings'
        })
    },

    onLoad() {
        // 生成随机花瓣
        const petalCloud = this.generatePetalCloud(12)
        const greetingMessage = this.pickRandomGreeting()
        this.setData({ petalCloud, greetingMessage })
    },

    async onShow() {
        if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
                selected: 0
            })
        }

        await app.ensureReady()
        const points = app.globalData.currentPoints
        const userInfo = app.globalData.userInfo || {}

        const needsProfile = typeof app.needsProfile === 'function' ? app.needsProfile(userInfo) : false
        if (needsProfile) {
            wx.navigateTo({
                url: '/pages/settings/settings?onboarding=true'
            })
            return
        }

        // 检查是否需要显示家长引导
        const showParentGuide = wx.getStorageSync('showParentGuide') || false

        const greetingMessage = this.pickRandomGreeting()
        this.setData({
            currentPoints: points,
            userInfo: userInfo,
            avatarDisplayUrl: this.getDisplayAvatarUrl(userInfo.avatarUrl),
            greetingMessage,
            showParentGuide
        })
        this.updateJarState(points)
        this.loadHistory()
    },


    refreshProfileState() {
        const userInfo = app.globalData.userInfo || {}
        this.setData({
            userInfo,
            avatarDisplayUrl: this.getDisplayAvatarUrl(userInfo.avatarUrl),
            showProfileAuth: typeof app.needsProfile === 'function' ? app.needsProfile(userInfo) : false
        })
    },

    // 获取显示用的头像URL
    getDisplayAvatarUrl(avatarUrl) {
        if (!avatarUrl) {
            return ''
        }
        // 如果是相对路径（以/uploads开头），加上后端服务器地址
        if (avatarUrl.startsWith('/uploads')) {
            return 'http://localhost:8081/api' + avatarUrl
        }
        // 如果是以//开头（协议相对），加上https:
        if (avatarUrl.startsWith('//')) {
            return 'https:' + avatarUrl
        }
        // 如果是完整URL，直接返回
        return avatarUrl
    },

    pickRandomGreeting() {
        const index = Math.floor(Math.random() * GREETING_MESSAGES.length)
        return GREETING_MESSAGES[index]
    },

    updateJarState(points) {
        // Assuming goal is 20 for now, or could be dynamic
        const goal = 100
        const ratio = Math.min(points / goal, 1)

        let suffix = '0'
        if (ratio >= 1) suffix = '100'
        else if (ratio >= 0.75) suffix = '75'
        else if (ratio >= 0.5) suffix = '50'
        else if (ratio >= 0.25) suffix = '25'

        this.setData({
            jarImage: `/assets/bottle_${suffix}.png`
        })
    },

    async loadHistory() {
        const childId = app.globalData.childId
        if (!childId) return

        this.setData({ loading: true })
        try {
            const history = await api.getPointHistory(childId)
            this.setData({
                history: history.map(item => ({
                    ...item,
                    formattedDate: this.formatDate(item.createdAt),
                    isIncome: item.change > 0
                })),
                loading: false
            })
        } catch (e) {
            console.error('Failed to load history', e)
            this.setData({ loading: false })
        }
    },

    formatDate(dateStr) {
        return dateUtil.formatMonthDayTime(dateStr)
    }
})
