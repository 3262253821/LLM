<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()
// 渲染完成后的 HTML 内容
const renderedHtml = computed(() => {
  return renderMarkdown(props.content)
})
</script>

<template>
  <!-- v-html 把 renderedHtml 里的 HTML 字符串，按真正的 HTML 插入页面。 -->
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>
