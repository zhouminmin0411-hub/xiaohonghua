Component({
    data: {
        selected: 0,
        color: "#5D4037",
        selectedColor: "#FF6B6B",
        list: [{
            pagePath: "/pages/wishes/wishes",
            text: "许愿瓶",
            iconPath: "/assets/icon_flower.png",
            selectedIconPath: "/assets/icon_flower.png"
        }, {
            pagePath: "/pages/index/index",
            text: "任务",
            iconPath: "/assets/icon_task.png",
            selectedIconPath: "/assets/icon_task.png"
        }, {
            pagePath: "/pages/rewards/rewards",
            text: "兑换",
            iconPath: "/assets/icon_gift.png",
            selectedIconPath: "/assets/icon_gift.png"
        }]
    },
    methods: {
        switchTab(e) {
            const data = e.currentTarget.dataset
            const url = data.path
            wx.switchTab({ url })
            this.setData({
                selected: data.index
            })
        }
    }
})
