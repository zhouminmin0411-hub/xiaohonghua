# 使用官方 OpenJDK 21 运行时作为基础镜像
FROM eclipse-temurin:21-jre-alpine

# 设置工作目录
WORKDIR /app

# 设置时区为上海
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 复制 Maven 构建产物
COPY target/xiaohonghua-backend-1.0.0.jar app.jar

# 创建日志目录和上传文件目录
RUN mkdir -p /var/log/xiaohonghua && \
    mkdir -p /app/uploads/avatars

# 暴露端口（云托管会自动映射）
EXPOSE 8080

# 设置JVM参数和启动应用
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 使用生产环境配置启动
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=prod"]

