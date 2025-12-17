# 微信登录相关API接口文档

本文档说明小程序微信登录功能需要后端实现的API接口。

## 1. 微信登录接口

### 接口说明
使用微信小程序的code换取用户openid，并创建或更新用户信息。

### 请求信息
- **URL**: `/api/auth/wechat-login`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数
```json
{
  "code": "微信小程序wx.login返回的code"
}
```

### 后端处理流程
1. 接收前端传来的code
2. 调用微信API：`https://api.weixin.qq.com/sns/jscode2session`
   - 参数：
     - `appid`: 小程序的AppID
     - `secret`: 小程序的AppSecret
     - `js_code`: 前端传来的code
     - `grant_type`: "authorization_code"
3. 获取返回的openid和session_key
4. 根据openid在数据库中查找用户：
   - 如果用户不存在，创建新用户记录
   - 如果用户存在，更新session_key
5. 返回用户信息和token

### 响应数据
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": 1,
    "openid": "user_openid",
    "nickname": "用户昵称",
    "avatarUrl": "头像URL",
    "role": "child",
    "childId": 1,
    "token": "JWT_TOKEN"
  }
}
```

## 2. 更新用户资料接口

### 接口说明
更新用户的昵称等信息。

### 请求信息
- **URL**: `/api/users/:userId/profile`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Header**: `Authorization: Bearer {token}`

### 请求参数
```json
{
  "nickname": "新昵称"
}
```

### 响应数据
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "avatarUrl": "头像URL"
  }
}
```

## 3. 上传头像接口

### 接口说明
上传用户头像图片。

### 请求信息
- **URL**: `/api/users/:userId/avatar`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Header**: `Authorization: Bearer {token}`

### 请求参数
- **avatar**: 图片文件（form-data）

### 后端处理流程
1. 接收上传的图片文件
2. 验证文件类型和大小
3. 将图片保存到服务器或云存储（如OSS、COS等）
4. 更新数据库中用户的avatarUrl字段
5. 返回新的头像URL

### 响应数据
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "https://your-cdn.com/avatars/user_1_timestamp.jpg"
  }
}
```

## 4. 数据库设计建议

### users表字段
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL,
  session_key VARCHAR(100),
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  role VARCHAR(20) DEFAULT 'child',
  child_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 5. 注意事项

1. **AppID和AppSecret安全**
   - 不要在前端代码中暴露AppSecret
   - AppSecret只能在后端使用
   
2. **Session Key管理**
   - session_key用于解密用户敏感数据
   - 需要安全存储
   - 定期更新

3. **Token管理**
   - 使用JWT或session管理用户登录状态
   - 设置合理的过期时间
   - 实现token刷新机制

4. **图片存储**
   - 建议使用云存储服务（阿里云OSS、腾讯云COS等）
   - 设置合理的图片大小限制（建议2MB以内）
   - 支持的格式：jpg、png、gif

5. **错误处理**
   - 统一的错误码规范
   - 友好的错误提示信息
   - 记录错误日志

## 6. 测试建议

1. **开发阶段**
   - 可以保留原有的`/api/auth/login`接口（使用openid直接登录）作为测试接口
   - 便于在没有真实微信环境下进行开发测试

2. **生产环境**
   - 只使用`/api/auth/wechat-login`接口
   - 确保AppID和AppSecret配置正确
   - 测试完整的登录流程

## 7. 前端已实现功能

- ✅ wx.login获取code
- ✅ 发送code到后端换取用户信息
- ✅ 使用button open-type="chooseAvatar"选择头像
- ✅ 使用input type="nickname"编辑昵称
- ✅ 头像和昵称的本地缓存
- ✅ 优雅的降级处理（后端接口未准备好时使用本地存储）

## 8. 后续优化建议

1. **用户首次登录引导**
   - 检测新用户，引导完善头像和昵称
   
2. **头像裁剪**
   - 添加头像裁剪功能，统一头像尺寸
   
3. **昵称敏感词过滤**
   - 后端添加昵称敏感词检测
   
4. **实名认证**
   - 如需要，可接入微信实名认证能力

