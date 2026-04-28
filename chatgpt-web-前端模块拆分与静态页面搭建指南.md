# chatgpt-web 前端模块拆分与静态页面搭建指南

> 目标：只聚焦前端，先把“静态页面 + 本地交互骨架”搭起来，不接后端。  
> 参考仓库：`https://github.com/Chanzhaoyu/chatgpt-web`

---

## 1. 先明确你现在要做的事情

你当前阶段不是做“完整 AI 平台”，而是做一个**可交互的前端聊天页面骨架**：

1. 左侧会话列表可切换
2. 右侧消息列表可展示
3. 底部输入框可发送
4. 基础状态（当前会话、消息、loading）能跑通

这四件事完成后，再接 API 会非常顺。

---

## 2. 原项目前端模块是怎么拆的

在 `chatgpt-web` 里，核心前端模块可以理解为三层。

### 2.1 布局层（页面外壳）

- `src/views/chat/layout/Layout.vue`：左右布局容器（侧边栏 + 主内容）
- `src/views/chat/layout/sider/index.vue`：侧边栏总容器
- `src/views/chat/layout/sider/List.vue`：会话列表

职责：只负责“页面结构”和“区域分布”。

### 2.2 业务层（聊天主流程）

- `src/views/chat/index.vue`：聊天页主流程（发送、更新、停止、清空等）
- `src/views/chat/components/Header/index.vue`：头部操作（移动端为主）
- `src/views/chat/components/Message/index.vue`：单条消息容器

职责：把“会话 -> 消息 -> 输入发送”串起来。

### 2.3 细节层（可复用逻辑）

- `src/views/chat/hooks/useScroll.ts`：滚动到底部逻辑
- `src/views/chat/hooks/useUsingContext.ts`：上下文开关
- `src/store/modules/chat/index.ts`：聊天状态集中管理

职责：把通用逻辑抽离，避免页面组件过于臃肿。

---

## 3. 你现在最适合的简化拆分（静态版）

建议先按下面 6 个文件做最小实现：

```txt
src/
  views/
    ChatPage.vue
  components/chat/
    ChatLayout.vue
    SessionList.vue
    ChatHeader.vue
    MessageList.vue
    MessageInput.vue
```

---

## 4. 各模块是干嘛的、怎么拆、为什么这样拆

## 4.1 `ChatPage.vue`（父组件，唯一数据源）

**它干嘛：**
- 持有全部核心状态：会话数组、当前会话 ID、消息数据、loading
- 接收子组件事件并更新状态

**为什么放父组件：**
- 会话列表和消息列表是兄弟组件，二者都依赖“当前会话”
- 共享状态必须提升到共同父级，避免数据分裂

**思路关键词：**单向数据流（props 下发 + emit 上抛）

---

## 4.2 `ChatLayout.vue`（纯布局壳）

**它干嘛：**
- 只负责左右结构：左栏放 `SessionList`，右栏放 `ChatHeader + MessageList + MessageInput`

**为什么独立：**
- 布局和业务分离，后面改 UI 不碰业务代码
- 你后续想换成响应式抽屉布局也更轻松

**思路关键词：**结构与逻辑解耦

---

## 4.3 `SessionList.vue`（会话管理区）

**它干嘛：**
- 展示会话列表
- 点击切换会话
-（后续）可加新建、重命名、删除

**为什么独立：**
- 会话区是独立高频模块，迭代频率与消息区不同
- 单独拆开便于后续做“会话搜索/分组/置顶”

**思路关键词：**按业务边界拆分

---

## 4.4 `MessageList.vue`（消息渲染区）

**它干嘛：**
- 渲染当前会话的消息流
- 区分 `user` 与 `assistant` 样式
-（后续）可加 markdown、代码高亮、复制

**为什么独立：**
- 消息渲染复杂度会持续增长（文本、代码块、图片等）
- 先隔离出来，避免把主页面写成“巨型组件”

**思路关键词：**复杂视图单独封装

---

## 4.5 `MessageInput.vue`（输入发送区）

**它干嘛：**
- 文本输入
- 回车发送 / Shift+Enter 换行
- 发送后清空

**为什么独立：**
- 输入逻辑天然独立，未来会扩展快捷词、上传、语音按钮
- 保持“输入组件只产出事件，不直接改全局数据”

**思路关键词：**交互入口组件化

---

## 4.6 `ChatHeader.vue`（顶部信息与操作）

**它干嘛：**
- 显示当前会话标题
- 放清空、导出、返回等动作入口

**为什么独立：**
- 顶部操作经常变动（尤其移动端）
- 作为独立栏位，更容易扩展产品感

**思路关键词：**动作入口集中管理

---

## 5. 一步一步搭建顺序（最实用）

## 第 1 步：只搭结构，不写业务

- 完成左右栏布局
- 右侧预留 Header / Main / Footer 区

**原因：**先稳定容器，后续组件直接填空，不返工。

## 第 2 步：做会话列表（假数据）

- 写死 3~5 条会话
- 点击切换高亮

**原因：**先建立“当前会话”概念，消息区才有上下文。

## 第 3 步：做消息列表（假数据）

- 渲染 user/assistant 两种消息卡片
- 保证滚动区域可用

**原因：**聊天产品核心视觉是消息流，优先实现。

## 第 4 步：做输入框

- 输入、发送、清空
- 发送按钮禁用逻辑

**原因：**形成可交互闭环，页面从“展示”变“可用”。

## 第 5 步：把状态统一到父组件

- `sessions`
- `activeSessionId`
- `messagesBySession`
- `loading`

**原因：**兄弟组件共享状态必须集中，否则后期难维护。

## 第 6 步：补体验细节

- 新建会话
- 清空当前会话
- “AI 正在思考...” 占位

**原因：**这是产品感增强，放在主链路之后做效率最高。

---

## 6. 你可以直接用的数据模型（静态版）

```ts
type Session = {
  id: number
  title: string
}

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
}

const sessions = ref<Session[]>([
  { id: 1, title: '默认会话' },
  { id: 2, title: 'Vue 组件通信' },
])

const activeSessionId = ref<number>(1)

const messagesBySession = ref<Record<number, Message[]>>({
  1: [
    { id: 1, role: 'assistant', content: '你好，我是 AI 助手。', time: '10:00' },
  ],
  2: [
    { id: 1, role: 'user', content: '讲讲 props 和 emit', time: '10:05' },
  ],
})

const loading = ref(false)
```

---

## 7. 推荐事件流（你照这个做就不会乱）

- `SessionList` 触发：`emit('select-session', id)`
- `MessageInput` 触发：`emit('send-message', text)`
- `ChatHeader` 触发：`emit('clear-session')`
- `ChatPage` 统一处理并改状态，再通过 props 传回子组件

这就是最标准的 Vue 组件协作路径。

---

## 8. 当前阶段先不要做的内容

1. 不做后端接口联调
2. 不做 markdown 复杂渲染
3. 不做鉴权、限流、部署
4. 不做多语言/主题深度配置

先把静态交互骨架跑通，之后再“替换消息来源”为真实 API。

---

## 9. 一句话收尾

你现在的正确路线是：

**先做“能切会话、能发消息、能展示消息”的前端骨架，再逐步把假数据替换成真实接口。**

这样你学到的不只是“这个项目怎么写”，而是“对话类前端项目应该怎么设计和拆分”。
