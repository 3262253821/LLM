<template>
  <RouterView />
</template>

<style>
:root {
  --app-bg: #f4f7fb;
  --app-surface: #ffffff;
  --app-surface-soft: #f8fafc;
  --app-border: #e2e8f0;
  --app-border-strong: #cbd5e1;
  --app-text-primary: #0f172a;
  --app-text-secondary: #64748b;
  --app-text-tertiary: #94a3b8;
  --app-primary: #2563eb;
  --app-primary-soft: #eff6ff;
  --app-success: #22c55e;
  --app-success-soft: #f0fdf4;
  --app-warning: #f59e0b;
  --app-danger: #ef4444;
  --app-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
}

:root[data-theme='dark'] {
  --app-bg: #0f172a;
  --app-surface: #111827;
  --app-surface-soft: #1f2937;
  --app-border: #334155;
  --app-border-strong: #475569;
  --app-text-primary: #e5eefb;
  --app-text-secondary: #94a3b8;
  --app-text-tertiary: #64748b;
  --app-primary: #60a5fa;
  --app-primary-soft: #1e3a8a;
  --app-success: #4ade80;
  --app-success-soft: #052e1a;
  --app-warning: #fbbf24;
  --app-danger: #f87171;
  --app-shadow: 0 18px 40px rgba(2, 6, 23, 0.45);
}

html,
body,
#app {
  margin: 0;
  height: 100%;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--app-bg);
  color: var(--app-text-primary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
</style>
