# llm-chat-frontend

这是仓库中的前端子项目，基于 Vue 3 + Vite + Pinia 构建。

## 主要能力

- 多会话聊天界面
- Markdown 与代码高亮
- 模型切换与 Temperature 调节
- 系统提示词配置
- 主题切换
- 登录、注册、个人中心
- 响应式布局

## 本地启动

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

## 环境变量

复制 `.env.example` 为 `.env.local`，并根据你的后端地址调整：

```bash
copy .env.example .env.local
```

## 说明

更完整的项目介绍、前后端联调方式、数据库初始化和接口说明，请查看仓库根目录的 [README](../README.md)。
