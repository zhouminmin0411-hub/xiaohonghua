const app = getApp()
const api = require('../../utils/realApi')

Page({
    data: {
        userInfo: {},
        currentPoints: 0,
        goalPoints: 20,
        history: [],
        loading: false,
        jarImage: '/assets/bottle_0.png',
        petalCloud: []
    },

    // 生成随机花瓣配置
    generatePetalCloud(count = 40) {
        const petals = []
        const maxDelay = 0  // 最大延迟16秒，让花瓣在16秒内陆续出现
        
        for (let i = 0; i < count; i++) {
            const startX = Math.random() * 450 + 50   // 50-500rpx 在容器区域
            const startY = Math.random() * 100  // 0-100rpx 从顶部区域随机位置开始
            // 水平位移：-80到+80rpx的漂移
            const horizontalDrift = (Math.random() - 0.5) * 160
            // 垂直位移：300-540rpx的绝对位移
            const verticalDrift = Math.random() * 240 + 300  // 300-540rpx
            const duration = Math.random() * 8 + 8  // 8-16秒
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
        wx.navigateTo({
            url: '/pages/settings/settings'
        })
    },

    onLoad() {
        // 生成随机花瓣
        const petalCloud = this.generatePetalCloud(12)
        this.setData({ petalCloud })
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
        this.setData({
            currentPoints: points,
            userInfo: app.globalData.userInfo || {}
        })
        this.updateJarState(points)
        this.loadHistory()
    },

    updateJarState(points) {
        // Assuming goal is 20 for now, or could be dynamic
        const goal = 20
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
        const date = new Date(dateStr)
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    }
})
