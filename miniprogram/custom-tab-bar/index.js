Component({
    data: {
        selected: 0,
        color: "#5D4037",
        selectedColor: "#FF6B6B",
        list: [{
            pagePath: "/pages/index/index",
            text: "任务",
            icon: "todo-list-o",
            selectedIcon: "todo-list"
        }, {
            pagePath: "/pages/wishes/wishes",
            text: "许愿瓶",
            icon: "flower-o",
            selectedIcon: "flower-o"
        }, {
            pagePath: "/pages/rewards/rewards",
            text: "兑换",
            icon: "gift-o",
            selectedIcon: "gift"
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
