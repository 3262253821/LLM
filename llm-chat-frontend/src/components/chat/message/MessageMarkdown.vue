<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedHtml = computed(() => {
  return renderMarkdown(props.content)
})
</script>

<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>
