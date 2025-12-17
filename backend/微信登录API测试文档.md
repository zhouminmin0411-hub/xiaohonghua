# 微信登录API测试文档

## 1. 配置准备

### 1.1 修改application.yml配置

在 `backend/src/main/resources/application.yml` 中，将微信小程序配置替换为实际的AppID和AppSecret：

```yaml
wechat:
  miniapp:
    appid: wx1234567890abcdef  # 替换为你的小程序AppID
    secret: your_real_secret_here  # 替换为你的小程序AppSecret
```

### 1.2 创建上传目录

确保上传目录存在（或程序会自动创建）：

```bash
cd backend
mkdir -p uploads/avatars
```

## 2. 启动后端服务

```bash
cd backend
mvn clean spring-boot:run
```

服务将在 http://localhost:8081/api 启动

## 3. API接口测试

### 3.1 微信登录接口

**接口地址：** POST `/api/auth/wechat-login`

**请求示例（使用curl）：**

```bash
curl -X POST http://localhost:8081/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "微信小程序wx.login返回的code"
  }'
```

**请求示例（使用Postman）：**

```
Method: POST
URL: http://localhost:8081/api/auth/wechat-login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "code": "0x1234567890abcdef"
}
```

**成功响应：**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXX",
    "unionId": null,
    "role": "child",
    "nickname": "小朋友",
    "avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    "childId": null,
    "createdAt": "2025-12-16 10:00:00",
    "updatedAt": "2025-12-16 10:00:00"
  }
}
```

### 3.2 更新用户资料接口

**接口地址：** PUT `/api/users/{userId}/profile`

**请求示例：**

```bash
curl -X PUT http://localhost:8081/api/users/1/profile \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "小明"
  }'
```

**成功响应：**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXX",
    "nickname": "小明",
    "avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/...",
    "role": "child"
  }
}
```

### 3.3 上传用户头像接口

**接口地址：** POST `/api/users/{userId}/avatar`

**请求示例（使用curl）：**

```bash
curl -X POST http://localhost:8081/api/users/1/avatar \
  -F "avatar=@/path/to/avatar.jpg"
```

**请求示例（使用Postman）：**

```
Method: POST
URL: http://localhost:8081/api/users/1/avatar
Body (form-data):
  Key: avatar (File type)
  Value: [选择图片文件]
```

**成功响应：**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "avatarUrl": "/uploads/avatars/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

## 4. 使用Swagger UI测试

访问 Swagger UI：http://localhost:8081/api/doc.html

在Swagger UI中可以直接测试所有接口。

### 测试步骤：

1. **测试微信登录**
   - 找到"认证接口"分组
   - 点击"微信登录"接口
   - 点击"Try it out"
   - 输入code（开发环境可以使用任意字符串测试）
   - 点击"Execute"
   - 记录返回的用户ID

2. **测试更新用户资料**
   - 找到"用户接口"分组
   - 点击"更新用户资料"接口
   - 输入用户ID和新的昵称
   - 点击"Execute"

3. **测试上传头像**
   - 找到"用户接口"分组
   - 点击"上传用户头像"接口
   - 输入用户ID
   - 选择图片文件
   - 点击"Execute"

## 5. Mock登录测试（开发环境）

如果微信AppID和AppSecret暂时不可用，可以使用Mock登录接口：

**接口地址：** POST `/api/auth/login`

**请求示例：**

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "openid": "mock_child_openid_001"
  }'
```

## 6. 错误处理测试

### 6.1 无效的code测试

```bash
curl -X POST http://localhost:8081/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "invalid_code"
  }'
```

**预期响应：**

```json
{
  "code": 500,
  "message": "微信登录失败：invalid code"
}
```

### 6.2 上传过大文件测试

上传一个超过2MB的图片文件，应该返回错误：

```json
{
  "code": 500,
  "message": "文件大小超过限制（最大2MB）"
}
```

### 6.3 上传不支持的文件类型

上传一个.txt或其他非图片文件，应该返回错误：

```json
{
  "code": 500,
  "message": "不支持的文件类型，只允许：jpg,jpeg,png,gif"
}
```

## 7. 数据库验证

测试完成后，可以在数据库中验证数据：

```sql
-- 查看用户表
SELECT * FROM user;

-- 查看最新创建的用户
SELECT * FROM user ORDER BY created_at DESC LIMIT 5;

-- 查看指定openid的用户
SELECT * FROM user WHERE openid = 'oXXXXXXXXXXXXXXXXXXXXXXXXX';
```

## 8. 前后端联调测试

### 8.1 前端配置

确保前端 `miniprogram/utils/realApi.js` 中的API地址正确：

```javascript
const CONFIG = {
  DEV_BASE_URL: 'http://localhost:8081/api',
  ENV: 'dev'
}
```

### 8.2 测试流程

1. 启动后端服务
2. 在微信开发者工具中打开小程序
3. 小程序会自动调用 `wx.login` 并发送code到后端
4. 查看后端日志，确认收到请求并成功响应
5. 在设置页面测试修改头像和昵称
6. 查看数据库验证数据已更新

### 8.3 查看日志

后端日志会显示：

```
微信登录请求，code=0x1234567890abcdef
调用微信code2session接口，code=0x1234567890abcdef
微信code2session成功，openid=oXXXXXXXXXXXXXXXXXXXXXXXXX
微信登录：创建新用户，openid=oXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 9. 常见问题

### 9.1 微信code已使用

**错误：** "invalid code, code been used"

**原因：** 微信code只能使用一次，5分钟内有效

**解决：** 重新在小程序中触发登录，获取新的code

### 9.2 微信AppID或AppSecret错误

**错误：** "invalid appid"

**原因：** 配置文件中的AppID或AppSecret不正确

**解决：** 检查application.yml配置，确保AppID和AppSecret正确

### 9.3 文件上传失败

**错误：** "创建上传目录失败"

**原因：** 没有权限创建上传目录

**解决：** 手动创建 `uploads/avatars` 目录，或修改文件权限

### 9.4 数据库连接失败

**错误：** "Communications link failure"

**原因：** MySQL未启动或配置错误

**解决：** 
1. 启动MySQL服务
2. 检查application.yml中的数据库配置
3. 确保数据库xiaohonghua已创建

## 10. 生产环境部署注意事项

1. **修改微信配置**
   - 使用生产环境的AppID和AppSecret
   - 在application-prod.yml中配置

2. **文件上传配置**
   - 配置云存储（如阿里云OSS、腾讯云COS）
   - 修改FileUploadUtil使用云存储SDK
   - 更新urlPrefix为CDN地址

3. **安全配置**
   - 添加token验证
   - 限制上传文件大小和频率
   - 添加图片内容审核

4. **性能优化**
   - 配置Redis缓存session_key
   - 使用异步上传
   - 图片自动压缩和裁剪

## 11. 测试清单

- [ ] 微信登录接口正常工作
- [ ] 新用户自动创建
- [ ] 老用户正常登录
- [ ] 更新昵称成功
- [ ] 上传头像成功
- [ ] 文件类型验证正常
- [ ] 文件大小验证正常
- [ ] 数据库数据正确保存
- [ ] 前后端联调成功
- [ ] 错误处理正常

