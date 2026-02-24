#!/bin/bash

# ========================================
#  macOS 构建 + 打包脚本
#  生成包含 install.command 的 ZIP 分发包
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="API-USE"
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

echo "🔨 开始构建 $APP_NAME v$VERSION ..."
echo ""

# 1. 执行 Tauri 构建
cd "$PROJECT_DIR"
pnpm tauri build

# 2. 定位构建产物
APP_PATH="$PROJECT_DIR/src-tauri/target/release/bundle/macos/$APP_NAME.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ 构建产物未找到：$APP_PATH"
    exit 1
fi

# 3. 创建分发目录
DIST_DIR="$PROJECT_DIR/dist-mac"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/$APP_NAME"

# 4. 复制文件
cp -R "$APP_PATH" "$DIST_DIR/$APP_NAME/"
cp "$SCRIPT_DIR/install.command" "$DIST_DIR/$APP_NAME/"
chmod +x "$DIST_DIR/$APP_NAME/install.command"

# 5. Ad-hoc 签名（减少警告）
codesign --force --deep --sign - "$DIST_DIR/$APP_NAME/$APP_NAME.app" 2>/dev/null || true

# 6. 打包为 ZIP
cd "$DIST_DIR"
ZIP_NAME="${APP_NAME}-v${VERSION}-mac.zip"
zip -r -y "$PROJECT_DIR/$ZIP_NAME" "$APP_NAME"

# 7. 清理
rm -rf "$DIST_DIR"

echo ""
echo "========================================"
echo "✅ 打包完成！"
echo "📦 输出：$PROJECT_DIR/$ZIP_NAME"
echo "========================================"
echo ""
echo "分发方式：将 $ZIP_NAME 发给用户"
echo "用户操作：解压 → 双击 install.command"
