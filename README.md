# API-USE (Ant Design + Tauri)

开源、无登录、纯本地存储的 API 调试工具。

- Web 端：React 18 + Vite + Ant Design + Dexie + Zustand
- Desktop 端：Tauri 2 + Rust(reqwest)
- 数据：本地 IndexedDB（`projects` / `nodes` / `apiItems`）

## 特性

- 项目管理：创建、编辑、删除、搜索
- 树结构管理：Folder/API 节点、新建、重命名、删除、上移/下移
- 请求编辑：Method、URL、Auth、Headers、Query、Body
- 请求执行：状态码、耗时、Headers、Body、错误信息
- 导入导出：单项目 JSON（version=1）
- 响应式：适配手机 / iPad / 电脑

## 快速开始

```bash
pnpm install
pnpm dev
```

Web 构建：

```bash
pnpm build
```

Tauri 开发：

```bash
pnpm tauri dev
```

Tauri 打包：

```bash
pnpm tauri build
```

## CORS 说明

- Web 模式通过浏览器 `fetch` 发请求，受浏览器 CORS 策略限制。
- Tauri 桌面模式由 Rust `reqwest` 发请求，不受浏览器 CORS 限制。
- 如果你在 Web 端遇到跨域失败，请切换到桌面端调试。

## 导入导出格式

导出 JSON 示例（`version=1`）：

```json
{
  "version": 1,
  "exportedAt": 1730000000,
  "project": {},
  "nodes": [],
  "apiItems": []
}
```

导入时会自动重建 id 映射，避免本地冲突。

## 目录结构

```text
src/
  app/             路由与页面
  components/      UI 组件
  stores/          Zustand 状态管理
  db/              Dexie 数据层
  executor/        web/tauri 请求执行抽象
  importExport/    导入导出
  types/           类型定义
  utils/           工具函数
src-tauri/
  src/request.rs   execute_request 实现
  src/lib.rs       Tauri command 注册
```

## 稳定性设计

- 请求默认超时：15s（可传 `timeoutMs`）
- 响应体上限：2MB，超出自动截断并提示
- 错误清晰回传：URL、网络、超时、TLS、CORS 等

## 常见问题排查

1. `pnpm tauri dev` 失败：先确认 Rust 工具链、Tauri 依赖已安装。
2. Web 请求报错 `Failed to fetch`：通常是 CORS 或网络问题。
3. 桌面打包失败：检查系统签名/平台打包依赖是否完整。
