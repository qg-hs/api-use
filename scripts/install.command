#!/bin/bash

# ========================================
#  API-USE 安装助手
#  双击此文件即可完成安装
# ========================================

APP_NAME="API-USE.app"
INSTALL_DIR="/Applications"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$SCRIPT_DIR/$APP_NAME"

clear
echo "========================================"
echo "  API-USE 安装助手"
echo "========================================"
echo ""

# 检查 .app 是否存在
if [ ! -d "$APP_PATH" ]; then
    echo "❌ 错误：未找到 $APP_NAME"
    echo "   请确保 $APP_NAME 与此安装脚本在同一目录下。"
    echo ""
    read -n 1 -s -r -p "按任意键退出..."
    exit 1
fi

echo "📦 正在安装 $APP_NAME 到 $INSTALL_DIR ..."
echo ""

# 移除隔离属性（解决"已损坏"问题）
xattr -cr "$APP_PATH" 2>/dev/null

# 复制到 /Applications
if [ -d "$INSTALL_DIR/$APP_NAME" ]; then
    echo "⚠️  检测到已安装的旧版本，正在替换..."
    rm -rf "$INSTALL_DIR/$APP_NAME"
fi

cp -R "$APP_PATH" "$INSTALL_DIR/"

if [ $? -eq 0 ]; then
    # 再次清除属性（确保复制后也干净）
    xattr -cr "$INSTALL_DIR/$APP_NAME" 2>/dev/null
    echo "✅ 安装成功！"
    echo ""
    echo "📍 安装位置：$INSTALL_DIR/$APP_NAME"
    echo ""
    read -p "是否立即启动 API-USE？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$INSTALL_DIR/$APP_NAME"
    fi
else
    echo "❌ 安装失败，请尝试手动拖入 Applications 文件夹后执行："
    echo "   xattr -cr /Applications/$APP_NAME"
    echo ""
    read -n 1 -s -r -p "按任意键退出..."
    exit 1
fi

echo ""
echo "按任意键关闭此窗口..."
read -n 1 -s -r
