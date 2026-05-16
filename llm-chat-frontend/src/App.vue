<template>
  <div class="app-shell">
    <RouterView />
  </div>
</template>

<style>
:root {
  --app-display-font:
    'Segoe UI Variable Display', 'Bahnschrift', 'PingFang SC', 'Microsoft YaHei UI', sans-serif;
  --app-body-font:
    'Segoe UI Variable Text', 'PingFang SC', 'Microsoft YaHei UI', 'Helvetica Neue', sans-serif;

  --app-bg: #edf2ec;
  --app-surface: rgba(255, 255, 255, 0.78);
  --app-surface-elevated: rgba(255, 255, 255, 0.92);
  --app-surface-soft: rgba(245, 248, 243, 0.76);
  --app-border: rgba(15, 23, 42, 0.08);
  --app-border-strong: rgba(15, 23, 42, 0.16);
  --app-text-primary: #10202a;
  --app-text-secondary: #556575;
  --app-text-tertiary: #7b8794;
  --app-primary: #0f766e;
  --app-primary-soft: rgba(15, 118, 110, 0.12);
  --app-success: #0f766e;
  --app-success-soft: rgba(15, 118, 110, 0.12);
  --app-warning: #f97316;
  --app-danger: #dc2626;
  --app-info: #2563eb;
  --app-shadow: 0 28px 60px rgba(15, 23, 42, 0.12);
  --app-backdrop-blur: blur(20px);
  --app-page-glow:
    radial-gradient(circle at 12% 10%, rgba(15, 118, 110, 0.18), transparent 26%),
    radial-gradient(circle at 88% 18%, rgba(249, 115, 22, 0.14), transparent 22%),
    radial-gradient(circle at 78% 78%, rgba(14, 165, 233, 0.12), transparent 22%),
    linear-gradient(135deg, #f7f7f2 0%, #edf2ec 42%, #f6efe5 100%);
}

:root[data-theme='dark'] {
  --app-bg: #071419;
  --app-surface: rgba(9, 22, 27, 0.78);
  --app-surface-elevated: rgba(9, 22, 27, 0.92);
  --app-surface-soft: rgba(14, 25, 32, 0.8);
  --app-border: rgba(148, 163, 184, 0.16);
  --app-border-strong: rgba(148, 163, 184, 0.28);
  --app-text-primary: #e6f0f2;
  --app-text-secondary: #a9b7bf;
  --app-text-tertiary: #7f91a0;
  --app-primary: #43c6b9;
  --app-primary-soft: rgba(67, 198, 185, 0.14);
  --app-success: #43c6b9;
  --app-success-soft: rgba(67, 198, 185, 0.14);
  --app-warning: #fb923c;
  --app-danger: #f87171;
  --app-info: #60a5fa;
  --app-shadow: 0 34px 70px rgba(0, 0, 0, 0.35);
  --app-page-glow:
    radial-gradient(circle at 14% 12%, rgba(67, 198, 185, 0.18), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(251, 146, 60, 0.14), transparent 22%),
    radial-gradient(circle at 84% 78%, rgba(96, 165, 250, 0.14), transparent 22%),
    linear-gradient(135deg, #061116 0%, #0b1a20 46%, #11131d 100%);
}

html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--app-body-font);
  background: var(--app-page-glow);
  color: var(--app-text-primary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: radial-gradient(circle at center, black 22%, transparent 100%);
  opacity: 0.35;
}

button,
input,
textarea,
select {
  font: inherit;
}

::selection {
  background: rgba(15, 118, 110, 0.18);
}

#app {
  position: relative;
}

.app-shell {
  min-height: 100%;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.32);
}

::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 640px) {
  body::before {
    opacity: 0.2;
    background-size: 72px 72px;
  }
}
</style>
