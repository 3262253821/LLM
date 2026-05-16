<script setup lang="ts">
interface Props {
  isMobile: boolean
  sidebarOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:sidebar-open', value: boolean): void
}>()

function closeSidebar() {
  emit('update:sidebar-open', false)
}
</script>

<template>
  <div class="chat-layout" :class="{ 'is-mobile': props.isMobile }">
    <div
      v-if="props.isMobile && props.sidebarOpen"
      class="chat-layout__mask"
      @click="closeSidebar"
    ></div>

    <aside
      class="chat-layout__sider"
      :class="{
        'is-mobile': props.isMobile,
        'is-open': props.sidebarOpen,
      }"
    >
      <slot name="sider" />
    </aside>

    <section class="chat-layout__main">
      <header class="chat-layout__header">
        <slot name="header" />
      </header>
      <main class="chat-layout__content">
        <slot name="content" />
      </main>
      <footer class="chat-layout__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.chat-layout {
  position: relative;
  display: flex;
  gap: 20px;
  height: 100dvh;
  padding: 20px;
  overflow: hidden;
}

.chat-layout__mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(3, 7, 18, 0.45);
  backdrop-filter: blur(10px);
}

.chat-layout__sider {
  position: relative;
  z-index: 40;
  flex: 0 0 304px;
  min-height: 0;
  min-width: 0;
  border: 1px solid var(--app-border);
  border-radius: 30px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  backdrop-filter: var(--app-backdrop-blur);
  overflow: hidden;
}

.chat-layout__main {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--app-border);
  border-radius: 34px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  backdrop-filter: var(--app-backdrop-blur);
  overflow: hidden;
}

.chat-layout__header {
  flex-shrink: 0;
  min-height: 86px;
  border-bottom: 1px solid var(--app-border);
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 100%);
}

.chat-layout__content {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-layout__footer {
  flex-shrink: 0;
  position: relative;
  z-index: 5;
  border-top: 1px solid var(--app-border);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 100%),
    var(--app-surface-soft);
}

@media (max-width: 1200px) {
  .chat-layout {
    height: 100dvh;
    gap: 16px;
    padding: 16px;
  }

  .chat-layout__sider {
    flex-basis: 280px;
  }
}

@media (max-width: 960px) {
  .chat-layout {
    height: 100dvh;
    padding: 12px;
  }

  .chat-layout__sider.is-mobile {
    position: fixed;
    top: 12px;
    bottom: 12px;
    left: 12px;
    width: min(86vw, 320px);
    transform: translateX(calc(-100% - 28px));
    transition: transform 0.24s ease;
  }

  .chat-layout__sider.is-mobile.is-open {
    transform: translateX(0);
  }

  .chat-layout__main {
    border-radius: 24px;
  }

  .chat-layout__header {
    min-height: 98px;
  }
}

@media (max-width: 640px) {
  .chat-layout {
    height: 100dvh;
    padding: 10px;
  }

  .chat-layout__sider.is-mobile {
    top: 10px;
    bottom: 10px;
    left: 10px;
    width: min(88vw, 320px);
    border-radius: 24px;
  }

  .chat-layout__main {
    border-radius: 20px;
  }
}
</style>
