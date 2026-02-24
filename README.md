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

| 平台    | 安装方式                                              |
| ------- | ----------------------------------------------------- |
| macOS   | 解压后双击 `install.command`                          |
| Windows | 双击 `.msi` 或 `.exe` 安装                            |
| Linux   | `dpkg -i .deb` / `rpm -i .rpm` / 直接运行 `.AppImage` |

## 📄 License

[MIT](LICENSE) © qg-hs
