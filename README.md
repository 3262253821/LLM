# LLM Chat Workspace

一个前后端分离的 LLM 对话平台，支持账号注册登录、多会话管理、模型切换、系统提示词配置、云端聊天状态同步，以及桌面端与移动端的统一体验。

## 项目简介

仓库包含一个基于 Vue 3 的聊天前端，以及一个基于 Express + MySQL 的后端服务。项目聚焦于真实可用的对话体验，不只是“能聊天”，还补齐了多会话、流式输出、账号体系、状态同步、响应式适配和提交前工程化整理。

## 亮点特性

- 多会话工作台：支持新建、切换、重命名、删除会话，并保留历史记录。
- 流式聊天体验：支持消息流式输出、停止生成、重新回答、Markdown 渲染和代码高亮。
- 可配置对话能力：支持系统提示词、模型切换、Temperature 调节等常用参数。
- 完整账号体系：包含注册、登录、个人中心、头像上传、密码修改等能力。
- 双端状态同步：聊天数据支持本地持久化，并在登录后与服务端同步。
- 响应式布局：聊天页、登录页、注册页、个人中心均适配桌面端和移动端。
- 交互与性能优化：补充 `throttle / debounce` 工具，优化高频滚动、窗口变化和状态持久化场景。
- 提交友好：补充 `.env.example`、仓库级 `.gitignore` 和子项目说明，便于直接托管到 GitHub。

## 技术栈

### Frontend

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Markdown-it
- Highlight.js

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- bcryptjs

## 目录结构

```text
LLM/
├─ llm-chat-frontend/        # Vue 3 前端
│  ├─ src/
│  ├─ public/
│  ├─ .env.example
│  └─ README.md
├─ llm-chat-server/          # Express + MySQL 后端
│  ├─ src/
│  ├─ sql/
│  └─ .env.example
├─ .gitignore
└─ README.md
```

## 功能概览

### 聊天功能

- 多会话管理
- 流式输出
- 停止生成
- 重新回答
- Markdown / 代码高亮
- 系统提示词
- Temperature 控制
- 模型切换

### 账号功能

- 注册
- 登录
- 获取当前用户信息
- 更新个人资料
- 修改密码

### 状态同步

- 本地 `localStorage` 持久化
- 登录后自动拉取服务端聊天状态
- 状态变更后自动回写服务端

## 运行环境

- Node.js `20.19+` 或 `22.12+`
- pnpm `10+`
- MySQL `8+`

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd LLM
```

### 2. 安装依赖

```bash
cd llm-chat-frontend
pnpm install
```

```bash
cd ../llm-chat-server
pnpm install
```

### 3. 初始化数据库

将 `llm-chat-server/sql/dbllmchat.sql` 导入到你的 MySQL 实例中，创建对应数据库和数据表。

### 4. 配置环境变量

前端：

```bash
cd llm-chat-frontend
copy .env.example .env.local
```

后端：

```bash
cd ../llm-chat-server
copy .env.example .env
```

请根据本地环境填写真实配置，尤其是：

- `DEEPSEEK_API_KEY`
- `JWT_SECRET`
- MySQL 连接信息
- 前端请求的后端地址

### 5. 启动后端

```bash
cd llm-chat-server
pnpm dev
```

默认地址：

- `http://localhost:3001`

### 6. 启动前端

```bash
cd llm-chat-frontend
pnpm dev
```

默认地址：

- `http://localhost:5173`

## 环境变量说明

### 前端 `llm-chat-frontend/.env.local`

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 后端服务地址 | `http://localhost:3001` |
| `VITE_LLM_MODEL` | 默认模型 | `deepseek-v4-flash` |

### 后端 `llm-chat-server/.env`

| 变量名 | 说明 |
| --- | --- |
| `PORT` | 后端端口 |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `DEEPSEEK_DEFAULT_MODEL` | 默认模型 |
| `JWT_SECRET` | JWT 签名密钥 |
| `MYSQL_HOST` | MySQL 主机 |
| `MYSQL_PORT` | MySQL 端口 |
| `MYSQL_USER` | MySQL 用户名 |
| `MYSQL_PASSWORD` | MySQL 密码 |
| `MYSQL_DATABASE` | MySQL 数据库名 |

## 常用脚本

### 前端

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm type-check
```

### 后端

```bash
pnpm dev
pnpm build
pnpm start
```

## 接口概览

### 鉴权接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`

### 聊天接口

- `POST /api/chat/stream`
- `GET /api/chat/state`
- `PUT /api/chat/state`

### 其他接口

- `GET /api/health`

## 最近整理

这次提交前，仓库已经额外补充了以下整理项：

- 前端 README 从默认模板改为项目说明。
- 前后端新增 `.env.example`，便于他人快速配置。
- 仓库级 `.gitignore` 已补上，避免误提交日志、构建产物、测试快照和本地环境文件。
- 前端交互、移动端适配和滚动体验已完成一轮修复与优化。

## 提交到 GitHub 前建议

- 不要提交真实 `.env` 文件、日志文件和本地产物。
- 如需开源发布，建议补充 `LICENSE` 文件，例如 `MIT`。
- 如果你准备展示项目，建议在仓库中再补 2 到 4 张页面截图。

## License

当前仓库未附带许可证文件。如需公开开源，建议补充 `MIT` 或你希望使用的其他许可证。
