#!/bin/bash

# ========================================
#  Linux 构建 + 打包脚本
#  生成 .deb / .rpm / .AppImage 安装包
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="API-USE"
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

echo ""
echo "========================================"
echo "  $APP_NAME v$VERSION Linux 构建"
echo "========================================"
echo ""

# 1. 执行 Tauri 构建
echo "[1/3] 正在构建..."
cd "$PROJECT_DIR"
pnpm tauri build

# 2. 定位构建产物
BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle"

# 3. 创建分发目录
DIST_DIR="$PROJECT_DIR/dist-linux"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# 4. 复制安装包
echo ""
echo "[2/3] 复制安装包..."

# .deb
if [ -d "$BUNDLE_DIR/deb" ]; then
    for f in "$BUNDLE_DIR/deb/"*.deb; do
        [ -f "$f" ] && cp "$f" "$DIST_DIR/" && echo "  ✅ DEB: $(basename "$f")"
    done
fi

# .rpm
if [ -d "$BUNDLE_DIR/rpm" ]; then
    for f in "$BUNDLE_DIR/rpm/"*.rpm; do
        [ -f "$f" ] && cp "$f" "$DIST_DIR/" && echo "  ✅ RPM: $(basename "$f")"
    done
fi

# .AppImage
if [ -d "$BUNDLE_DIR/appimage" ]; then
    for f in "$BUNDLE_DIR/appimage/"*.AppImage; do
        [ -f "$f" ] && cp "$f" "$DIST_DIR/" && echo "  ✅ AppImage: $(basename "$f")"
    done
fi

# 5. 打包为 tar.gz
echo ""
echo "[3/3] 打包中..."
ZIP_NAME="${APP_NAME}-v${VERSION}-linux.tar.gz"
cd "$DIST_DIR"
tar -czf "$PROJECT_DIR/$ZIP_NAME" ./*
cd "$PROJECT_DIR"

# 6. 清理
rm -rf "$DIST_DIR"

echo ""
echo "========================================"
echo "✅ 打包完成！"
echo "📦 输出：$PROJECT_DIR/$ZIP_NAME"
echo "========================================"
echo ""
echo "安装方式："
echo "  DEB (Ubuntu/Debian): sudo dpkg -i xxx.deb"
echo "  RPM (Fedora/RHEL):   sudo rpm -i xxx.rpm"
echo "  AppImage:             chmod +x xxx.AppImage && ./xxx.AppImage"
