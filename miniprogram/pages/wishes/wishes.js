const app = getApp()

Page({
    data: {
        currentPoints: 0,
        goalPoints: 20,
        jarImage: '/assets/bottle_0.png',
        jarAnimate: false,
        petalCloud: [
            { rx: 140, ry: 18, duration: 12, phase: 0.1, scale: 0.9 },
            { rx: 135, ry: 16, duration: 12.8, phase: 0.35, scale: 0.86 },
            { rx: 150, ry: 20, duration: 13.5, phase: 0.6, scale: 0.95 },
            { rx: 145, ry: 14, duration: 12.5, phase: 0.8, scale: 0.9 },
            { rx: 130, ry: 18, duration: 13.2, phase: 0.25, scale: 0.92 },
            { rx: 138, ry: 12, duration: 11.5, phase: 0.55, scale: 0.88 }
        ]
    },

    async onShow() {
        if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
                selected: 1
            })
        }

        await app.ensureReady()
        this.setData({
            currentPoints: app.globalData.currentPoints
        })
        this.updateJarState(app.globalData.currentPoints, this.data.goalPoints)
    },

    onHide() {
        this.clearJarTimer()
    },

    onUnload() {
        this.clearJarTimer()
    },

    updateJarState(points = 0, goal = 20) {
        const safeGoal = Math.max(goal || 20, 1)
        const ratio = Math.max(0, Math.min(points / safeGoal, 1))
        let state = '0'
        if (ratio >= 0.85) {
            state = '100'
        } else if (ratio >= 0.6) {
            state = '75'
        } else if (ratio >= 0.35) {
            state = '50'
        } else if (ratio >= 0.1) {
            state = '25'
        }

        const imageMap = {
            '0': '/assets/bottle_0.png',
            '25': '/assets/bottle_25.png',
            '50': '/assets/bottle_50.png',
            '75': '/assets/bottle_75.png',
            '100': '/assets/bottle_100.png'
        }
        const jarImage = imageMap[state] || imageMap['0']

        const shouldPop = this.prevJarState !== state && this.prevJarState !== undefined
        this.prevJarState = state

        this.setData({
            jarImage,
            goalPoints: Math.round(safeGoal),
            jarAnimate: shouldPop
        })

        if (shouldPop) {
            this.clearJarTimer()
            this.jarAnimTimer = setTimeout(() => {
                this.setData({ jarAnimate: false })
                this.jarAnimTimer = null
            }, 480)
        }
    },

    clearJarTimer() {
        if (this.jarAnimTimer) {
            clearTimeout(this.jarAnimTimer)
            this.jarAnimTimer = null
        }
    }
})
