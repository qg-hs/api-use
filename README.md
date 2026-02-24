# API-USE

<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="API-USE">
</p>

<p align="center">
  <strong>轻量级 API 接口管理与调试工具</strong>
</p>

<p align="center">
  <a href="https://github.com/qg-hs/api-use/releases">
    <img src="https://img.shields.io/github/v/release/qg-hs/api-use?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/qg-hs/api-use/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/qg-hs/api-use?style=flat-square" alt="License">
  </a>
</p>

---

## ✨ 功能特性

- 🗂️ **多项目管理** — 按项目组织和管理 API 接口
- 🌲 **树形目录** — 文件夹 + 接口的层级结构，支持拖拽排序
- 🚀 **请求调试** — 支持 GET / POST / PUT / DELETE / PATCH，JSON / Form / Text 等多种 Body 类型
- 🔐 **认证支持** — Bearer Token 认证
- 🌍 **环境变量** — 多环境配置，一键切换，变量自动替换
- 📦 **导入导出** — 项目级 JSON 导入导出
- 🎨 **主题系统** — 10 套精心调配的深色 / 浅色主题
- 📱 **响应式** — 适配桌面端、平板、移动端
- 💻 **跨平台** — 基于 Tauri 2，支持 macOS / Windows / Linux

## 📸 截图

> 截图待补充

## 🛠️ 技术栈

| 层       | 技术                                                |
| -------- | --------------------------------------------------- |
| 前端     | React 18 + TypeScript + Ant Design + Tailwind CSS 4 |
| 状态管理 | Zustand                                             |
| 本地存储 | Dexie (IndexedDB)                                   |
| 桌面框架 | Tauri 2 (Rust)                                      |
| 构建工具 | Vite                                                |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm
- Rust (用于 Tauri 编译)

### 开发

```bash
# 克隆仓库
git clone https://github.com/qg-hs/api-use.git
cd api-use

# 安装依赖
pnpm install

# 启动开发模式
pnpm tauri:dev
```

### 构建

```bash
# macOS
pnpm build:mac

# Windows
pnpm build:win

# Linux
pnpm build:linux
```

## 📁 项目结构

```
api-use/
├── src/                    # 前端源码
│   ├── app/                # 页面组件
│   ├── components/         # 通用组件
│   ├── db/                 # IndexedDB 数据层
│   ├── executor/           # 请求执行器
│   ├── importExport/       # 导入导出
│   ├── stores/             # Zustand 状态管理
│   ├── styles/             # 主题 & 全局样式
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri (Rust) 后端
├── scripts/                # 构建脚本
│   ├── build-mac.sh
│   ├── build-win.bat
│   ├── build-linux.sh
│   └── install.command     # macOS 安装助手
└── public/                 # 静态资源
```

## 📥 下载安装

前往 [Releases](https://github.com/qg-hs/api-use/releases) 下载对应平台的安装包。

| 平台                  | 文件格式                      | 安装方式                    |
| --------------------- | ----------------------------- | --------------------------- |
| macOS (Apple Silicon) | `.dmg`                        | 双击挂载后拖入 Applications |
| macOS (Intel)         | `.dmg`                        | 同上                        |
| Windows               | `.msi` / `.exe`               | 双击安装                    |
| Linux                 | `.deb` / `.rpm` / `.AppImage` | 见下方说明                  |

### 🍎 macOS 安装提示

由于本应用未进行 Apple 开发者签名和公证，macOS Gatekeeper 可能会阻止应用运行并提示 **"已损坏，无法打开"** 或 **"无法验证开发者"**。

**这并不意味着应用真的损坏了**，只是 macOS 对未签名应用的安全策略。

#### 解决方法

安装完成后，打开 **终端 (Terminal)**，执行以下命令：

```bash
sudo xattr -rd com.apple.quarantine /Applications/API-USE.app
```

输入系统密码后回车即可。之后就能正常打开应用了。

> **原理说明**：macOS 会给从网络下载的文件添加 `com.apple.quarantine` 隔离属性，Gatekeeper 检测到该属性后会验证签名。上述命令移除隔离属性，跳过签名验证。

#### 其他方式

- **右键打开**：在 Finder 中右键点击 `API-USE.app` → 选择「打开」→ 在弹窗中点击「打开」
- **系统设置**：打开「系统设置 → 隐私与安全性」，在底部找到被阻止的应用，点击「仍要打开」

### 🪟 Windows 安装提示

首次运行可能出现 **SmartScreen** 提示「Windows 已保护你的电脑」，点击 **「更多信息」→「仍要运行」** 即可。

### 🐧 Linux 安装

```bash
# Debian / Ubuntu
sudo dpkg -i API-USE_x.x.x_amd64.deb

# Fedora / RHEL
sudo rpm -i API-USE-x.x.x-1.x86_64.rpm

# AppImage（任意发行版）
chmod +x API-USE_x.x.x_amd64.AppImage
./API-USE_x.x.x_amd64.AppImage
```

## 📄 License

[MIT](LICENSE) © qg-hs
