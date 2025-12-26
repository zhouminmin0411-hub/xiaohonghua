#!/bin/bash

# 小红花后端服务启动脚本
# 自动设置正确的Java版本并启动服务

echo "🌸 小红花后端服务启动脚本"
echo "================================"

# 设置Java 21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=$JAVA_HOME/bin:$PATH

# 检查Java版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
echo "✅ 当前Java版本: $JAVA_VERSION"

if [[ ! $JAVA_VERSION == 21.* ]]; then
    echo "❌ 错误: 需要Java 21，当前版本是 $JAVA_VERSION"
    echo "请检查Java安装: brew list --versions | grep openjdk"
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  警告: 端口8081已被占用"
    echo "正在尝试终止占用进程..."
    PID=$(lsof -Pi :8081 -sTCP:LISTEN -t)
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ 已清理端口"
fi

# 检查MySQL服务
if ! brew services list | grep mysql | grep started >/dev/null 2>&1; then
    echo "⚠️  警告: MySQL服务未运行"
    echo "正在启动MySQL..."
    brew services start mysql
    sleep 3
fi

echo "================================"
echo "🚀 启动Spring Boot服务..."
echo "================================"
echo ""

# 启动服务
mvn spring-boot:run






