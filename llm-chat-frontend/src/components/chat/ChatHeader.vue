<script setup lang="ts">
// 用interface声明props的类型
interface Props {
  title: string
  messageCount: number
  loading: boolean
}
// 泛型，让 props 获得类型检查
// 把上面定义的Props接口注册到组件上，等价于
/* 
  *不写泛型的等效写法（没有 TS 类型检查）
  defineProps({
    title: String,
    messageCount: Number,
    loading: Boolean,
})
*/
defineProps<Props>()
// 泛型，声明事件名和签名
// 声明了emit clear-session，只能发送clear-session这个事件，不能发送其他事件
const emit = defineEmits<{
  (e: 'clear-session'): void
}>()
// 清空会话
function onClear() {
  emit('clear-session')
}
</script>
<template>
  <div class="chat-header">
    <div class="chat-header__left">
      <h3 class="chat-header__title">{{ title }}</h3>
      <p class="chat-header__meta">
        消息数：{{ messageCount }} <span v-if="loading">· AI 正在思考...</span>
      </p>
    </div>
    <div class="chat-header__right">
      <button class="chat-header__clear-btn" @click="onClear">清空当前会话</button>
    </div>
  </div>
</template>
<style scoped>
.chat-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.chat-header__title {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}
.chat-header__meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}
.chat-header__clear-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
