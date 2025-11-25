# 小红花API测试指南

## 测试环境准备

### 1. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

服务启动后访问：http://localhost:8080/api/doc.html

### 2. 确保数据库已初始化

```bash
# 连接MySQL
mysql -h localhost -P 3306 -u root -p

# 执行建表脚本
SOURCE sql/schema.sql;

# 执行种子数据
SOURCE sql/seed.sql;
```

### 3. 测试工具

推荐使用：
- Knife4j在线文档：http://localhost:8080/api/doc.html
- Postman/Apifox
- curl命令行

---

## 接口测试用例清单

### 一、认证相关（2个测试用例）

#### 1. 测试登录接口

**请求：**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "openid": "mock_child_openid_001"
}
```

**预期结果：**
- 状态码：200
- 返回用户信息（id=1, nickname=小明）

#### 2. 测试家长密码验证（正确密码）

**请求：**
```http
POST http://localhost:8080/api/auth/verify-parent-password
Content-Type: application/json

{
  "userId": 1,
  "password": "0000"
}
```

**预期结果：**
- 状态码：200
- `data.verified = true`

#### 3. 测试家长密码验证（错误密码）

**请求：**
```http
POST http://localhost:8080/api/auth/verify-parent-password
Content-Type: application/json

{
  "userId": 1,
  "password": "1234"
}
```

**预期结果：**
- 状态码：200
- `data.verified = false`

---

### 二、任务相关（5个测试用例）

#### 4. 获取任务列表

**请求：**
```http
GET http://localhost:8080/api/tasks
```

**预期结果：**
- 状态码：200
- 返回10个任务
- 所有任务`isActive = true`

#### 5. 创建新任务（家长权限）

**请求：**
```http
POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "type": "daily",
  "icon": "✏️",
  "title": "完成作业",
  "description": "认真完成今天的作业",
  "reward": 5,
  "timeEstimate": "30分钟",
  "createdByParentId": 2
}
```

**预期结果：**
- 状态码：200
- 返回创建的任务，包含自增ID

#### 6. 更新任务信息

**请求：**
```http
PUT http://localhost:8080/api/tasks/11
Content-Type: application/json

{
  "type": "daily",
  "icon": "✏️",
  "title": "完成作业（已修改）",
  "description": "认真完成今天的作业",
  "reward": 6,
  "timeEstimate": "30分钟"
}
```

**预期结果：**
- 状态码：200
- 返回更新后的任务

#### 7. 删除任务（软删除）

**请求：**
```http
DELETE http://localhost:8080/api/tasks/11
```

**预期结果：**
- 状态码：200
- message="删除成功"

#### 8. 验证删除后任务不在列表中

**请求：**
```http
GET http://localhost:8080/api/tasks
```

**预期结果：**
- 返回的任务列表中不包含ID=11的任务

---

### 三、任务记录相关（5个测试用例）

#### 9. 领取任务

**请求：**
```http
POST http://localhost:8080/api/task-records/receive?childId=1&taskId=2
```

**预期结果：**
- 状态码：200
- 创建任务记录，`status = "received"`

#### 10. 完成任务

**请求：**
```http
POST http://localhost:8080/api/task-records/complete?recordId=8
```

**预期结果：**
- 状态码：200
- 任务记录状态变为`completed`
- 积分历史中增加一条记录

#### 11. 查询本周完成记录

**请求：**
```http
GET http://localhost:8080/api/task-records?childId=1&status=completed
```

**预期结果：**
- 返回孩子的已完成任务记录列表

#### 12. 点赞任务记录

**请求：**
```http
POST http://localhost:8080/api/task-records/1/like
```

**预期结果：**
- 状态码：200
- `parentLikedAt`字段设置为当前时间

#### 13. 取消点赞

**请求：**
```http
DELETE http://localhost:8080/api/task-records/1/like
```

**预期结果：**
- 状态码：200
- `parentLikedAt`字段设置为null

---

### 四、奖励相关（4个测试用例）

#### 14. 获取奖励列表

**请求：**
```http
GET http://localhost:8080/api/rewards
```

**预期结果：**
- 返回8个奖励
- 按消耗积分升序排序

#### 15. 创建新奖励

**请求：**
```http
POST http://localhost:8080/api/rewards
Content-Type: application/json

{
  "title": "看动画片",
  "cost": 12,
  "icon": "🎬",
  "type": "virtual",
  "createdByParentId": 2
}
```

**预期结果：**
- 状态码：200
- 返回创建的奖励

#### 16. 更新奖励信息

**请求：**
```http
PUT http://localhost:8080/api/rewards/9
Content-Type: application/json

{
  "title": "看动画片（已修改）",
  "cost": 15,
  "icon": "🎬",
  "type": "virtual"
}
```

**预期结果：**
- 返回更新后的奖励

#### 17. 删除奖励

**请求：**
```http
DELETE http://localhost:8080/api/rewards/9
```

**预期结果：**
- 状态码：200
- 奖励`isActive = false`

---

### 五、兑换相关（3个测试用例）

#### 18. 兑换奖励（积分足够）

先查询当前积分，确保足够：

**请求：**
```http
POST http://localhost:8080/api/reward-records/redeem?childId=1&rewardId=1
```

**预期结果：**
- 状态码：200
- 创建兑换记录
- 积分历史中增加一条扣减记录（负数）

#### 19. 兑换奖励（积分不足）

**请求：**
```http
POST http://localhost:8080/api/reward-records/redeem?childId=1&rewardId=4
```

**预期结果：**
- 状态码：500
- message="积分不足，无法兑换"

#### 20. 查询兑换记录

**请求：**
```http
GET http://localhost:8080/api/reward-records?childId=1
```

**预期结果：**
- 返回孩子的兑换记录列表

---

### 六、积分相关（5个测试用例）

#### 21. 获取当前积分

**请求：**
```http
GET http://localhost:8080/api/points/current?childId=1
```

**预期结果：**
- 返回当前积分（根据积分历史汇总计算）

#### 22. 获取积分历史

**请求：**
```http
GET http://localhost:8080/api/points/history?childId=1
```

**预期结果：**
- 返回所有积分变动记录
- 包含task、reward、adjustment、weekly等类型

#### 23. 手动调整积分（+正数）

**请求：**
```http
POST http://localhost:8080/api/points/adjust
Content-Type: application/json

{
  "childId": 1,
  "change": 10,
  "reason": "测试增加积分"
}
```

**预期结果：**
- 积分历史中增加一条`sourceType = "adjustment"`的记录

#### 24. 手动调整积分（-负数）

**请求：**
```http
POST http://localhost:8080/api/points/adjust
Content-Type: application/json

{
  "childId": 1,
  "change": -5,
  "reason": "测试扣减积分"
}
```

**预期结果：**
- 积分历史中增加一条负数记录

#### 25. 验证积分不能为负数

先将积分调整到接近0，然后尝试大额扣减：

**请求：**
```http
POST http://localhost:8080/api/points/adjust
Content-Type: application/json

{
  "childId": 1,
  "change": -10000,
  "reason": "测试负数限制"
}
```

**预期结果：**
- 状态码：500
- message="调整后积分不能为负数"

---

### 七、每周配置相关（3个测试用例）

#### 26. 获取每周配置

**请求：**
```http
GET http://localhost:8080/api/weekly-config?childId=1
```

**预期结果：**
- 返回孩子的每周配置（如果不存在则自动创建默认配置）

#### 27. 更新每周配置

**请求：**
```http
PUT http://localhost:8080/api/weekly-config?childId=1
Content-Type: application/json

{
  "weeklyAmount": 30,
  "dayOfWeek": 1,
  "time": "09:00",
  "enabled": true
}
```

**预期结果：**
- 配置更新成功

#### 28. 验证配置保存成功

**请求：**
```http
GET http://localhost:8080/api/weekly-config?childId=1
```

**预期结果：**
- 返回刚才更新的配置

---

### 八、定时任务相关（4个测试用例）

#### 29. 手动触发定时任务

由于定时任务每分钟执行一次，可以通过以下方式测试：

1. 修改配置，设置发放时间为当前时间+1分钟
2. 等待定时任务执行
3. 查看日志和积分历史

**验证方法：**
```bash
# 查看日志
tail -f logs/spring.log | grep "每周积分发放"
```

#### 30. 验证积分历史中记录了weekly类型

**请求：**
```http
GET http://localhost:8080/api/points/history?childId=1
```

**预期结果：**
- 存在`sourceType = "weekly"`的记录

#### 31. 验证last_sent_at更新

**请求：**
```http
GET http://localhost:8080/api/weekly-config?childId=1
```

**预期结果：**
- `lastSentAt`字段为最近的发放时间

#### 32. 验证不会重复发放

在同一天同一时间，定时任务不应重复发放。可以通过以下方式验证：

1. 查看发放前的积分历史记录数
2. 等待定时任务执行
3. 再次查看积分历史，确保只增加了1条记录

---

## 业务流程测试

### 流程1：小朋友完成任务获得积分

```bash
# 1. 登录
POST /auth/login {"openid": "mock_child_openid_001"}

# 2. 获取任务列表
GET /tasks

# 3. 领取任务
POST /task-records/receive?childId=1&taskId=3

# 4. 完成任务
POST /task-records/complete?recordId=9

# 5. 验证积分增加
GET /points/current?childId=1

# 6. 验证积分历史记录
GET /points/history?childId=1
```

### 流程2：小朋友兑换奖励

```bash
# 1. 查看当前积分
GET /points/current?childId=1

# 2. 获取奖励列表
GET /rewards

# 3. 兑换奖励
POST /reward-records/redeem?childId=1&rewardId=1

# 4. 验证积分扣减
GET /points/current?childId=1

# 5. 验证兑换记录生成
GET /reward-records?childId=1

# 6. 验证积分历史记录
GET /points/history?childId=1
```

### 流程3：家长管理任务和奖励

```bash
# 1. 验证家长密码
POST /auth/verify-parent-password {"userId": 1, "password": "0000"}

# 2. 创建新任务
POST /tasks {...}

# 3. 小朋友领取并完成
POST /task-records/receive?childId=1&taskId=11
POST /task-records/complete?recordId=10

# 4. 家长查看完成记录
GET /task-records?childId=1&status=completed

# 5. 家长点赞
POST /task-records/10/like

# 6. 家长创建新奖励
POST /rewards {...}

# 7. 小朋友兑换
POST /reward-records/redeem?childId=1&rewardId=9
```

### 流程4：家长调整积分

```bash
# 1. 查看当前积分
GET /points/current?childId=1

# 2. 手动增加积分
POST /points/adjust {"childId": 1, "change": 10, "reason": "额外奖励"}

# 3. 验证积分变化
GET /points/current?childId=1

# 4. 验证历史记录
GET /points/history?childId=1
```

### 流程5：每周积分发放

```bash
# 1. 配置每周发放
PUT /weekly-config?childId=1 {...}

# 2. 等待定时任务执行（或手动触发）
# 查看日志输出

# 3. 验证积分增加
GET /points/current?childId=1

# 4. 验证历史记录
GET /points/history?childId=1
```

---

## 边界测试

### 1. 积分不足时兑换
- 查询积分 → 选择超出积分的奖励 → 兑换失败

### 2. 删除的任务不可领取
- 删除任务 → 尝试领取 → 失败

### 3. 重复完成同一任务
- 完成任务 → 再次尝试完成 → 失败

### 4. 积分扣减至负数
- 调整积分为大额负数 → 失败

---

## 性能测试

### 查询接口响应时间

使用curl测试：

```bash
# 任务列表
time curl http://localhost:8080/api/tasks

# 积分历史
time curl "http://localhost:8080/api/points/history?childId=1"
```

**预期：**
- 查询接口 < 200ms
- 事务接口 < 500ms

---

## 测试通过标准

- [ ] 所有32个测试用例通过
- [ ] 5个业务流程测试通过
- [ ] 边界测试全部通过
- [ ] 性能测试达标
- [ ] 无SQL错误
- [ ] 日志无ERROR级别输出
- [ ] Swagger文档可正常访问
- [ ] 所有接口返回格式统一

---

## 常见问题

### Q1: 数据库连接失败
- 检查MySQL是否启动
- 检查application-dev.yml中的连接信息

### Q2: 接口返回500错误
- 查看控制台日志
- 检查请求参数是否正确

### Q3: Swagger无法访问
- 确认knife4j.enable=true
- 访问 http://localhost:8080/api/doc.html

---

**测试完成后，请将结果记录在测试报告中。**

