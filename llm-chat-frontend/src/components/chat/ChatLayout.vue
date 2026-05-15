<template>
  <div class="chat-layout">
    <aside class="chat-layout__sider">
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
  display: flex;
  height: 100%;
  background: var(--app-bg);
}

.chat-layout__sider {
  width: 260px;
  border-right: 1px solid var(--app-border);
  background: var(--app-surface);
  overflow: hidden;
}

.chat-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-layout__header {
  height: 60px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
}

.chat-layout__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-layout__footer {
  border-top: 1px solid var(--app-border);
  background: var(--app-surface);
}

@media (max-width: 900px) {
  .chat-layout__sider {
    width: 220px;
  }
}
</style>
