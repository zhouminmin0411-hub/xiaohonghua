# 小红花后端服务

## 项目简介

小红花小程序后端服务，基于Spring Boot + MyBatis-Plus + MySQL开发。

## 技术栈

- Java 17
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.5
- MySQL 8.0
- Maven 3.8+
- Knife4j (Swagger UI)

## 快速开始

### 1. 环境准备

请参考 [环境部署指南](docs/环境部署指南.md) 完成以下准备工作：

- JDK 17
- Maven 3.8+
- MySQL 8.0
- 阿里云RDS或自建MySQL

### 2. 数据库初始化

```bash
# 连接到MySQL
mysql -h your-host -P 3306 -u your-username -p

# 创建数据库
CREATE DATABASE xiaohonghua DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入建表脚本
USE xiaohonghua;
SOURCE sql/schema.sql;

# 导入种子数据
SOURCE sql/seed.sql;
```

### 3. 修改配置

编辑 `src/main/resources/application-dev.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://your-host:3306/xiaohonghua?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your-username
    password: your-password
```

### 4. 编译运行

```bash
# 编译
mvn clean package

# 运行
mvn spring-boot:run

# 或直接运行jar包
java -jar target/xiaohonghua-backend-1.0.0.jar
```

### 5. 访问API文档

启动成功后访问：http://localhost:8080/api/doc.html

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/xiaohonghua/
│   │   │   ├── XiaohonghuaApplication.java  # 启动类
│   │   │   ├── entity/                      # 实体类
│   │   │   ├── mapper/                      # MyBatis Mapper
│   │   │   ├── service/                     # 业务逻辑层
│   │   │   │   └── impl/                    # Service实现
│   │   │   ├── controller/                  # API控制器
│   │   │   ├── dto/                         # 数据传输对象
│   │   │   ├── vo/                          # 视图对象
│   │   │   ├── config/                      # 配置类
│   │   │   ├── interceptor/                 # 拦截器
│   │   │   ├── exception/                   # 异常类
│   │   │   ├── common/                      # 通用类
│   │   │   │   ├── Result.java              # 统一响应
│   │   │   │   ├── ResultCode.java          # 响应码
│   │   │   │   └── BusinessException.java   # 业务异常
│   │   │   └── scheduled/                   # 定时任务
│   │   └── resources/
│   │       ├── application.yml              # 主配置
│   │       ├── application-dev.yml          # 开发环境
│   │       ├── application-prod.yml         # 生产环境
│   │       └── mapper/                      # XML映射文件
│   └── test/                                # 测试代码
├── sql/
│   ├── schema.sql                           # 建表脚本
│   └── seed.sql                             # 种子数据
├── docs/                                    # 文档
├── pom.xml                                  # Maven配置
└── README.md                                # 项目说明
```

## API接口

### 认证相关 (/api/auth)
- POST /login - 用户登录
- POST /verify-parent-password - 验证家长密码

### 任务相关 (/api/tasks)
- GET /api/tasks - 获取任务列表
- POST /api/tasks - 创建任务
- PUT /api/tasks/{id} - 更新任务
- DELETE /api/tasks/{id} - 删除任务

### 任务记录相关 (/api/task-records)
- POST /api/task-records/receive - 领取任务
- POST /api/task-records/complete - 完成任务
- GET /api/task-records - 查询任务记录
- POST /api/task-records/{id}/like - 点赞
- DELETE /api/task-records/{id}/like - 取消点赞

### 奖励相关 (/api/rewards)
- GET /api/rewards - 获取奖励列表
- POST /api/rewards - 创建奖励
- PUT /api/rewards/{id} - 更新奖励
- DELETE /api/rewards/{id} - 删除奖励

### 兑换记录相关 (/api/reward-records)
- POST /api/reward-records/redeem - 兑换奖励
- GET /api/reward-records - 查询兑换记录

### 积分相关 (/api/points)
- GET /api/points/current - 获取当前积分
- GET /api/points/history - 获取积分历史
- POST /api/points/adjust - 手动调整积分

### 每周配置相关 (/api/weekly-config)
- GET /api/weekly-config - 获取配置
- PUT /api/weekly-config - 更新配置

## 开发指南

### 添加新接口

1. 在 `entity/` 下创建实体类
2. 在 `mapper/` 下创建Mapper接口
3. 在 `service/` 下创建Service接口和实现
4. 在 `controller/` 下创建Controller
5. 添加Swagger注解
6. 编写单元测试

### 运行测试

```bash
mvn test
```

### 打包部署

```bash
# 打包
mvn clean package -Dmaven.test.skip=true

# 上传到服务器
scp target/xiaohonghua-backend-1.0.0.jar user@server:/path/to/app/

# 启动服务
java -jar -Dspring.profiles.active=prod xiaohonghua-backend-1.0.0.jar
```

## 常见问题

### Q: 启动报错 "Access denied for user"
A: 检查 application-dev.yml 中的数据库用户名和密码是否正确

### Q: 如何修改服务端口？
A: 修改 application.yml 中的 `server.port`

### Q: Swagger文档无法访问？
A: 确保 knife4j.enable=true，访问 http://localhost:8080/api/doc.html

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/your-repo/xiaohonghua
- 问题反馈: https://github.com/your-repo/xiaohonghua/issues

