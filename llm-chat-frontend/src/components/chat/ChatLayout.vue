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
  background: #f4f7fb;
}
.chat-layout__sider {
  width: 260px;
  border-right: 1px solid #e5e7eb;
  background: #fff;
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
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.chat-layout__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.chat-layout__footer {
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
@media (max-width: 900px) {
  .chat-layout__sider {
    width: 220px;
  }
}
</style>
