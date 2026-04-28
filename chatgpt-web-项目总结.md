# chatgpt-web 项目总结（LLM 对话平台参考）

> 仓库：`Chanzhaoyu/chatgpt-web`  
> 地址：`https://github.com/Chanzhaoyu/chatgpt-web`  
> 定位：基于 `Vue 3 + Express` 的 ChatGPT 对话演示项目  
> 结论先行：非常适合拿来拆「聊天产品核心流程」，不建议整仓 1:1 复刻。

## 1. 项目概览

`chatgpt-web` 是一个前后端分离但同仓管理的对话产品 Demo：

- 前端：Vue 3 + Vite + Pinia + Naive UI
- 后端：Express + chatgpt（Node SDK 封装）
- 能力：多会话、上下文对话、流式输出、基础鉴权、主题/语言、导入导出

项目在 GitHub 已是 **Archived（只读归档）** 状态，仍然有较高参考价值，但不建议直接作为长期生产基座。

## 2. 为什么它适合当前阶段

结合你的目标（Vue 3 语法复习 + LLM 对话平台练手），它的优势主要在：

1. **结构直观**：聊天页、侧边会话、输入发送、消息流式更新都在清晰路径下。
2. **拆分粒度友好**：页面和逻辑分离明显，适合按模块逐步抄结构、再自己重写。
3. **状态管理可学习**：会话与消息状态集中在 Pinia，便于理解数据流。
4. **对话核心闭环完整**：发送 -> 流式回包 -> 更新消息 -> 停止生成 -> 重试生成，链路完整。

一句话：它非常像“可读性较好的参考母版”。

## 3. 技术栈与工程特征

### 3.1 前端

- 框架：`vue@^3.2.47`
- 构建：`vite@^4.2.0`
- 状态：`pinia@^2.0.33`
- UI：`naive-ui@^2.34.3`
- 路由：`vue-router@^4.1.6`
- 国际化：`vue-i18n@^9.2.2`

前端脚本（根目录 `package.json`）：

- `pnpm dev`：本地开发
- `pnpm build`：构建
- `pnpm bootstrap`：安装依赖并初始化 husky

### 3.2 后端

- 框架：`express@^4.18.2`
- 关键依赖：`chatgpt`、`express-rate-limit`、`dotenv`
- 运行脚本（`service/package.json`）：
  - `pnpm start`：启动服务（`esno ./src/index.ts`）
  - `pnpm dev`：监听模式
  - `pnpm prod`：运行构建产物

### 3.3 部署

支持多种方式：

- Docker（`Dockerfile`、`docker-compose/docker-compose.yml`）
- Railway / Sealos（README 有环境变量说明）
- 手动部署（前后端分开）

## 4. 关键目录与文件（重点看这些）

### 4.1 聊天主流程（前端）

- `src/views/chat/index.vue`：聊天主页面（发送、停止、重试、导出等交互）
- `src/views/chat/hooks/useChat.ts`：聊天数据操作封装
- `src/views/chat/hooks/useScroll.ts`：滚动行为控制
- `src/views/chat/hooks/useUsingContext.ts`：上下文开关
- `src/views/chat/components/Message`：消息渲染组件
- `src/views/chat/components/Header`：移动端头部操作区

### 4.2 布局与会话列表

- `src/views/chat/layout/Layout.vue`：聊天页主布局
- `src/views/chat/layout/sider/index.vue`：侧边栏容器
- `src/views/chat/layout/sider/List.vue`：会话列表（切换、选中、管理）
- `src/views/chat/layout/sider/Footer.vue`：侧栏底部操作

### 4.3 状态管理（Pinia）

- `src/store/modules/chat/index.ts`：聊天消息与会话核心状态
- `src/store/modules/settings/index.ts`：系统设置（温度、系统提示词等）
- `src/store/modules/auth/index.ts`：访问授权状态
- `src/store/modules/prompt/index.ts`：提示词模板

### 4.4 前后端接口衔接

- `src/api/index.ts`：前端 API 封装（`/chat-process`、`/config`、`/session`、`/verify`）
- `service/src/index.ts`：Express 路由入口
- `service/src/chatgpt/index.ts`：与模型交互、代理配置、超时/错误处理
- `service/src/middleware/auth.ts`：鉴权中间件
- `service/src/middleware/limiter.ts`：限流中间件

### 4.5 路由与页面组织

- `src/router/index.ts`：主路由（`/chat/:uuid?` + 异常页）
- `src/views/exception/*`：错误页面

## 5. 对话产品的核心实现思路（可直接借鉴）

从 `src/views/chat/index.vue` 可以提炼出标准闭环：

1. 读取输入并创建用户消息。
2. 插入“AI 思考中”占位消息。
3. 调用流式接口 `fetchChatAPIProcess`。
4. 在下载进度中持续更新最后一条 AI 消息。
5. 支持中止（`AbortController`）。
6. 处理错误、重试、上下文续聊。

这套链路对你做简化版 LLM 对话页非常实用。

## 6. 安装与运行（仓库已有做法）

### 6.1 前置

- Node：`^16 || ^18 || ^19`（README 说明）
- 包管理器：`pnpm`
- 环境变量：复制 `service/.env.example` 为 `service/.env`，至少配置
  - `OPENAI_API_KEY` 或
  - `OPENAI_ACCESS_TOKEN`

### 6.2 本地启动

```bash
# 1) 启动后端
cd service
pnpm install
pnpm start

# 2) 启动前端（仓库根目录）
pnpm bootstrap
pnpm dev
```

默认后端监听 `3002`。

## 7. 结合你当前阶段的“正确参考方式”

### 7.1 推荐你优先拆的 6 块

1. 会话列表（新建、切换、高亮）
2. 消息列表（用户/AI 双角色渲染）
3. 输入区（回车发送、清空、禁用）
4. 加载态（思考中、停止生成）
5. 状态管理（当前会话、会话数组、消息数组、loading）
6. 异步流程（请求、流式回显、错误处理）

### 7.2 建议映射到你自己的组件

- `ChatLayout`
- `SessionList`
- `MessageList`
- `MessageInput`

父组件统一管理状态与请求；子组件专注展示和 `emit` 事件。

## 8. 不建议直接照搬的部分

1. 项目已归档，依赖和 OpenAI 生态有时间差，建议只借鉴结构与流程。
2. `ChatGPTUnofficialProxyAPI` 属于历史方案，生产环境建议走官方兼容 API 路径。
3. 不要一开始就复刻完整功能（多语言、导入导出、复杂设置、部署全链路）。
4. 先做最小可运行版本，再逐步补功能和 UI 细节。

## 9. 可执行落地计划（按 4 个阶段）

### 阶段 1：最小版跑通（核心）

- 完成左右布局 + 会话切换 + 消息发送/渲染 + loading

### 阶段 2：完善交互

- 加入中止生成、错误提示、重新生成

### 阶段 3：提升产品感

- 增加设置面板、主题、快捷操作

### 阶段 4：工程化增强

- 接入真实后端、鉴权、限流、部署

## 10. 总结

`chatgpt-web` 作为你当前的主参考仓库是正确选择：

- 它足够接近你的目标（Vue 3 对话平台）
- 核心模块完整且可拆
- 学习成本与收益比很高

最重要的是：**把它当“结构和流程参考”，不要当“完整复刻模板”**。先自己写出简化版，再迭代复杂功能，效率会更高。
