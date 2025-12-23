#!/bin/bash

# 小红花后端打包脚本
# 用于微信云托管部署

echo "🌸 开始打包小红花后端..."

# 设置 Java 21 环境
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=$JAVA_HOME/bin:$PATH

# 检查 Java 版本
echo "📌 检查 Java 版本..."
java -version

# 清理并打包
echo "📦 开始 Maven 打包..."
mvn clean package -DskipTests

# 检查打包结果
if [ -f "target/xiaohonghua-backend-1.0.0.jar" ]; then
    echo "✅ 打包成功！"
    echo "📄 文件位置: target/xiaohonghua-backend-1.0.0.jar"
    echo "📊 文件大小: $(du -h target/xiaohonghua-backend-1.0.0.jar | cut -f1)"
    echo ""
    echo "🚀 下一步："
    echo "1. 打开微信开发者工具"
    echo "2. 云开发 → 云托管 → 上传代码"
    echo "3. 选择目录: $(pwd)"
else
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi

