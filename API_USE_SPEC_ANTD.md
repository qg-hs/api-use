# API-USE（开源版）项目开发文档（Tauri + Web + Ant Design）

> 目标：做一个**开源、无需登录注册**的 API 调试工具，支持 **macOS / Windows（Tauri）** 与 **Web**（静态站点）共用一套前端代码。  
> 特别说明：**Web 端受 CORS 限制**；桌面端通过 Rust 发请求不受 CORS 影响。

---

## 1. 产品目标与范围

### 1.1 目标
- 轻量替代“临时 Postman 调试”，主打：**项目化管理 + 树结构组织 + 一键发送 + 响应展示 + 导入导出**
- 开源友好：零后端、零账号、数据本地存储

### 1.2 MVP 必做
1. **项目管理**
   - 创建 / 编辑 / 删除项目
   - 项目列表（数量、搜索）
2. **接口树（树结构）**
   - Folder / API 两种节点
   - 新建文件夹、新建接口
   - 重命名、删除
   - 简单排序（sortOrder；MVP 不做拖拽，可做“上移/下移”）
3. **接口编辑与执行**
   - 接口名称
   - Method：GET / POST / PUT / DELETE
   - URL（完整 URL）
   - Tabs：Auth / Headers / Query / Body
   - Body 类型：form-data、json、text、html、javascript（后 3 者按 text 处理）
   - Send 执行请求，展示响应：status、耗时、headers、body、error
4. **导入导出**
   - 导出项目 JSON
   - 导入 JSON 到当前工作区
5. **跨平台**
   - Web：`pnpm dev` / `pnpm build`
   - Tauri：`pnpm tauri dev` / `pnpm tauri build`（mac/windows）

### 1.3 MVP 不做（后续增强）
- 登录/注册/企业协作
- 环境变量/全局变量（后续可加）
- 历史记录对比（后续可加）
- OpenAPI/Postman 导入导出（后续可加）
- 自动化测试、Mock、脚本（后续可加）

---

## 2. 平台差异与关键约束（务必实现）

### 2.1 CORS（Web 的硬限制）
- Web 端直接请求第三方接口时，可能被浏览器 CORS 拦截。
- 桌面端（Tauri）用 Rust `reqwest` 发请求，不受 CORS 限制。

**策略：统一抽象 executor**
- 前端统一调用：`executeRequest(config): Promise<RunResult>`
- Web 实现：`fetchExecutor`
- Tauri 实现：`tauriExecutor`（invoke Rust command）

> README 中必须明确：Web 端受 CORS 影响；如需无 CORS，使用桌面端或未来的本地代理模式（可选增强）。

### 2.2 本地存储
- Web：IndexedDB（推荐）
- Desktop：可以继续用 IndexedDB（WebView 内可用），或后续升级为 sqlite/本地文件

---

## 3. 技术选型（明确版本与库）

### 3.1 前端（Web 与 Tauri 共用）
- **React 18 + TypeScript + Vite**
- **Ant Design（antd）**：布局、表格、树、Tabs、Modal、Form、Button、Dropdown 等
- 状态管理：**Zustand**（轻量）
- 数据请求/缓存（可选但推荐）：**@tanstack/react-query**（本项目虽无后端，但可用于异步 storage 与执行请求的状态管理）
- 本地存储：**Dexie**（IndexedDB 封装，强烈推荐，适合结构化数据）
- 请求工具：Web 端用 **fetch**（或 axios 也可）；桌面端由 Rust 执行请求
- JSON 编辑（MVP 简化）：`textarea + JSON 校验 + pretty print`
  - 后续可增强：Monaco Editor（可选，体积大）

### 3.2 桌面端
- **Tauri 2.x**
- Rust：`reqwest` 执行请求；可选 `serde` 做序列化

### 3.3 其他推荐库（可选使用）
- `nanoid`：生成 id
- `lodash-es`：少量工具函数（可不用）
- `react-router-dom`：路由
- `dayjs`：时间格式化（项目列表/导出时间）

---

## 4. 信息架构与页面

### 4.1 页面
1. `/` 项目列表页
   - 创建项目按钮
   - 项目数量
   - 项目列表卡片/表格
   - 每项菜单：编辑、删除、导出
2. `/project/:projectId` 项目详情页
   - 左侧：树（文件夹/接口）
   - 右侧：接口编辑器 + 响应面板

### 4.2 UI 布局（Ant Design Layout）
```
Header（返回/项目名/导入按钮/导出按钮）
-------------------------------------------------
|  Sider(Tree)  |    Content(Request Editor)    |
|               |    Tabs + Send + Response     |
-------------------------------------------------
```

---

## 5. 数据模型（前端统一结构）

> 全部数据存本地（IndexedDB）。结构保持稳定，方便导入导出。

### 5.1 Project
```ts
type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};
```

### 5.2 TreeNode
```ts
type NodeType = "folder" | "api";

type TreeNode = {
  id: string;
  projectId: string;
  parentId: string | null;
  type: NodeType;
  name: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};
```

### 5.3 ApiItem（接口详情）
```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type BodyType = "none" | "form" | "json" | "text" | "html" | "javascript";

type KV = { key: string; value: string; enabled: boolean };

type ApiItem = {
  id: string;
  projectId: string;
  nodeId: string;               // 对应 TreeNode.id（type=api）
  name: string;
  method: HttpMethod;
  url: string;

  auth: { type: "none" | "bearer"; token?: string };

  headers: KV[];
  query: KV[];

  body: {
    type: BodyType;
    value: any;                 // form: KV[]; json: object; text/html/js: string
  };

  updatedAt: number;
};
```

### 5.4 RunResult（响应结果）
```ts
type RunResult = {
  status: number | null;
  durationMs: number;
  headers: Record<string, string>;
  body: string;                 // 原始文本
  error: string | null;
};
```

---

## 6. 本地存储（Dexie 设计）

### 6.1 DB 表
- `projects`：key = id
- `nodes`：key = id；index：projectId, parentId
- `apiItems`：key = id；index：projectId, nodeId

### 6.2 约束
- 删除项目：级联删除 nodes + apiItems
- 删除 folder：递归删除其子节点及 apiItems
- 删除 api 节点：删除对应 apiItem

---

## 7. 请求执行（Executor 抽象）

### 7.1 前端统一接口
```ts
type RequestConfig = {
  method: HttpMethod;
  url: string;
  auth: { type: "none" | "bearer"; token?: string };
  headers: KV[];
  query: KV[];
  body: { type: BodyType; value: any };
  timeoutMs?: number; // 默认 15000
};

export interface Executor {
  execute(config: RequestConfig): Promise<RunResult>;
}
```

### 7.2 Web Executor（fetch）
- 拼接 query 到 url
- 过滤 enabled=false 的 header/query
- 设置 Authorization: Bearer xxx（当 auth.type=bearer）
- body 序列化：
  - json: `JSON.stringify`
  - form: MVP 用 `application/x-www-form-urlencoded`（KV[] -> URLSearchParams）
  - text/html/javascript: string
- 返回 RunResult（包含耗时统计）

> 注意：Web 端可能被 CORS 阻止，错误要清晰展示到 UI。

### 7.3 Tauri Executor（invoke Rust）
- 前端通过 `@tauri-apps/api/core` 的 `invoke("execute_request", payload)`
- Rust 使用 `reqwest` 发起请求，返回 RunResult

---

## 8. Tauri（Rust）命令设计

### 8.1 execute_request（必须）
```rust
#[tauri::command]
async fn execute_request(payload: RequestPayload) -> Result<RunResult, String>;
```

#### 要求
- 默认超时 15s（可从 payload 传入）
- 记录 durationMs
- 回传响应 headers（建议转为 key->value；同名 header 可合并为逗号串）
- body 以文本返回（限制最大大小，如 2MB；超出截断并提示）
- 失败要返回 error 信息（DNS/timeout/TLS 等）

---

## 9. 前端组件设计（Ant Design）

### 9.1 ProjectListPage（/）
- `Table` 或 `Card` 列表
- `Modal + Form` 创建/编辑项目
- `Dropdown` 操作菜单（编辑/删除/导出）
- 顶部 `Upload`（导入 JSON）

### 9.2 ProjectPage（/project/:id）
左侧：
- `Tree` 展示节点
- `Dropdown`（右键或节点菜单）：新建文件夹、新建接口、重命名、删除、上移/下移
右侧：
- `Form`（接口名称、Method Select、URL Input）
- `Tabs`：Auth / Headers / Query / Body
  - Auth：`Radio` none/bearer + `Input.Password` token
  - Headers/Query：`Table` 可编辑行（key/value/enabled）
  - Body：
    - type select：none/form/json/text/html/javascript
    - form：Table(KV)
    - json：textarea + 校验按钮 + 格式化按钮
    - text/html/javascript：textarea
- `Button primary`：Send
- `ResponseViewer`：`Descriptions` + `Tabs`（Body/Headers）+ `Typography.Text` 错误

### 9.3 状态管理（Zustand）
- `useProjectStore`：projects、CRUD
- `useTreeStore`：nodes、selectedNodeId、CRUD
- `useApiStore`：currentApiItem、draft、save
- `useRunStore`：runState（loading/result/error）

---

## 10. 交互流程（关键）

### 10.1 打开项目
1. 加载 project
2. 加载 nodes（按 projectId）
3. 将 nodes 转为 Tree 结构供 antd Tree 渲染
4. 默认选中第一个 api 节点（如存在）
5. 加载对应 apiItem

### 10.2 编辑保存策略
- 编辑器右侧修改时，先更新 draft（内存）
- 点击保存（或自动防抖保存）写回 IndexedDB
- 切换节点时提示未保存（MVP 可直接自动保存）

### 10.3 执行请求
1. 点击 Send
2. 从 draft 组装 RequestConfig
3. 调用 executor
4. 显示响应；可将 lastResult 存在内存或 IndexedDB（可选）

---

## 11. 导入导出（开源核心能力）

### 11.1 导出格式（JSON）
```json
{
  "version": 1,
  "exportedAt": 1730000000,
  "project": { "id": "...", "name": "...", "description": "...", "createdAt": 0, "updatedAt": 0 },
  "nodes": [ ...TreeNode ],
  "apiItems": [ ...ApiItem ]
}
```

### 11.2 导入规则
- 导入到本地：若 id 冲突，全部重新生成 id，并维护 parentId / nodeId 映射
- 导入后更新 updatedAt

---

## 12. 目录结构（建议）

```
api-use/
├── src/
│   ├── app/                 # 路由与页面
│   ├── components/          # antd 组件封装：Tree、Editor、Response
│   ├── stores/              # Zustand stores
│   ├── db/                  # Dexie schema + CRUD
│   ├── executor/            # webExecutor / tauriExecutor + types
│   ├── importExport/
│   ├── types/
│   └── utils/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   └── request.rs       # execute_request 实现
│   └── Cargo.toml
├── package.json
├── vite.config.ts
└── README.md
```

---

## 13. 脚本与构建要求（必须能一键跑）

### 13.1 pnpm scripts
- `pnpm dev`：Web 开发
- `pnpm build`：Web 构建
- `pnpm tauri dev`：桌面开发
- `pnpm tauri build`：桌面构建（mac/windows）

### 13.2 README 必须写清楚
- Web 端 CORS 限制说明
- Tauri 端不受 CORS 影响
- 导入导出格式
- 如何打包 mac/windows
- 常见错误排查（Rust/tauri 版本、权限）

---

## 14. 安全与稳定（最低要求）

- 执行请求默认超时 15s，可配置
- 响应体最大 2MB（超出截断并提示）
- 错误信息展示清晰（DNS、timeout、CORS、TLS）
- （可选增强）SSRF 防护：阻止访问 127.0.0.1、169.254.169.254、内网段  
  > 开源工具通常允许本地调试内网接口，这点是否启用由你决定；MVP 可先不做拦截，但要在 README 提醒风险。

---

## 15. MVP 验收清单
- [ ] 创建/编辑/删除项目
- [ ] 树：创建 folder/api、重命名、删除
- [ ] 接口：method/url/auth/header/query/body 编辑
- [ ] Send：能执行请求并展示响应（状态码、耗时、headers、body、error）
- [ ] 导入/导出 JSON 可用
- [ ] Web 可用（CORS 允许的接口可成功）
- [ ] Tauri 可在 mac/windows 构建成功

---

## 16. 给 AI 生成代码的指令（直接复制）

请根据本开发文档生成一个**可运行的完整项目**（开源、无登录注册）：

1. 前端：React18 + TS + Vite + Ant Design（antd）。
2. 数据：本地 IndexedDB（Dexie），实现 projects/nodes/apiItems 三张表，CRUD 完整。
3. UI：项目列表页、项目详情页（左 Tree，右接口编辑器 + 响应面板），使用 antd 的 Layout/Tree/Tabs/Table/Form/Modal/Dropdown。
4. 请求执行：实现 executor 抽象：
   - Web：fetchExecutor（注意 CORS 错误处理、耗时统计）。
   - Tauri：tauriExecutor，通过 invoke 调用 Rust command `execute_request`。
5. Tauri：src-tauri Rust 使用 reqwest 实现 `execute_request`，支持超时、返回 status/durationMs/headers/body/error，并限制 body 最大 2MB。
6. 导入导出：实现单项目 JSON 导入导出（version=1），处理 id 冲突与 parentId/nodeId 映射。
7. 提供 pnpm scripts：`dev`、`build`、`tauri dev`、`tauri build`。提供 README，说明 Web CORS 与桌面无 CORS。
8. 要求：`pnpm install` 后可直接运行 Web；`pnpm tauri dev` 可运行桌面；`pnpm build` 构建 Web；`pnpm tauri build` 打包桌面。

---

**文档结束**
