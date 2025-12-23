# 小红花小程序 - 云函数代码包

**环境ID：** `cloud1-6gmt7m654faa5008`  
**创建时间：** 2025-12-23

---

## 📦 云函数列表（共13个）

### 核心功能（6个）

| 云函数名 | 功能 | 状态 |
|---------|------|------|
| `login` | 用户登录 | ✅ 已准备 |
| `getTasks` | 获取任务列表 | ✅ 已准备 |
| `receiveTask` | 领取任务 | ✅ 已准备 |
| `completeTask` | 完成任务 | ✅ 已准备 |
| `getCurrentPoints` | 获取当前积分 | ✅ 已准备 |
| `getRewards` | 获取奖品列表 | ✅ 已准备 |

### 扩展功能（7个）

| 云函数名 | 功能 | 状态 |
|---------|------|------|
| `getTaskRecords` | 获取任务记录 | ✅ 已准备 |
| `getPointHistory` | 获取积分历史 | ✅ 已准备 |
| `exchangeReward` | 兑换奖品 | ✅ 已准备 |
| `createTask` | 创建任务（家长） | ✅ 已准备 |
| `updateTask` | 更新任务（家长） | ✅ 已准备 |
| `deleteTask` | 删除任务（家长） | ✅ 已准备 |
| `createReward` | 创建奖品（家长） | ✅ 已准备 |
| `updateReward` | 更新奖品（家长） | ✅ 已准备 |
| `deleteReward` | 删除奖品（家长） | ✅ 已准备 |
| `adjustPoints` | 调整积分（家长） | ✅ 已准备 |

---

## 🚀 快速部署

### 方法1：逐个创建（推荐新手）

每个云函数的部署步骤：

1. **在微信开发者工具中**
   - 右键点击 `miniprogram/cloudfunctions` 目录
   - 选择"新建 Node.js 云函数"
   - 输入云函数名（如 `login`）

2. **复制代码**
   - 打开对应的 `index.js` 文件
   - 复制全部内容到新创建的云函数的 `index.js`
   - 同样复制 `package.json` 的内容

3. **上传部署**
   - 右键云函数文件夹
   - 选择"上传并部署：云端安装依赖"
   - 等待部署完成

4. **重复以上步骤**部署所有13个云函数

---

### 方法2：批量复制（推荐熟练用户）

```bash
# 在终端执行
cd /Users/xila/xiaohonghua

# 创建 cloudfunctions 目录（如果不存在）
mkdir -p miniprogram/cloudfunctions

# 复制所有云函数
cp -r 云函数代码包/* miniprogram/cloudfunctions/

# 删除 README.md（不需要上传）
rm miniprogram/cloudfunctions/README.md
```

然后在微信开发者工具中：
1. 右键 `cloudfunctions` 目录
2. 选择"更多设置" → "选择云开发环境"
3. 选择：`cloud1-6gmt7m654faa5008`
4. 逐个右键每个云函数文件夹
5. 选择"上传并部署：云端安装依赖"

---

## ✅ 部署检查清单

部署每个云函数后，请勾选：

**核心功能：**
- [ ] login
- [ ] getTasks
- [ ] receiveTask
- [ ] completeTask
- [ ] getCurrentPoints
- [ ] getRewards

**扩展功能：**
- [ ] getTaskRecords
- [ ] getPointHistory
- [ ] exchangeReward
- [ ] createTask
- [ ] updateTask
- [ ] deleteTask
- [ ] createReward
- [ ] updateReward
- [ ] deleteReward
- [ ] adjustPoints

---

## 🧪 测试云函数

部署完成后，建议测试主要功能：

1. **在云开发控制台** → **云函数**
2. **选择云函数**（如 `login`）
3. **点击"云端测试"**
4. **输入测试参数**
5. **查看返回结果**

### 测试示例

**测试 getTasks：**
```json
{}
```
期望返回：`{"code": 200, "data": []}`

**测试 getCurrentPoints：**
```json
{
  "childId": "test123"
}
```
期望返回：`{"code": 200, "data": {"points": 0}}`

---

## 📝 注意事项

1. **环境ID配置**
   - 所有云函数已配置环境ID：`cloud1-6gmt7m654faa5008`
   - 如需修改，请在每个云函数的 `cloud.init()` 中更改

2. **依赖安装**
   - 首次部署务必选择"云端安装依赖"
   - 这样会自动安装 `wx-server-sdk`

3. **权限配置**
   - 云函数自动拥有数据库读写权限
   - 无需额外配置

4. **日志查看**
   - 云开发控制台 → 云函数 → 日志
   - 可查看调用记录和错误信息

---

## 🎯 部署后的下一步

所有云函数部署完成后：

1. ✅ 修改小程序代码（调用云函数）
2. ✅ 本地测试
3. ✅ 真机测试
4. ✅ 上传代码并提交审核

---

**祝部署顺利！** 🌸

