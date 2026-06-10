<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
/* 现代化极简排版重置 */
:root {
  --primary-color: #2563eb; /* 采用更沉稳的科技蓝 */
  --bg-color: #ffffff;
  --bg-color-alt: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--bg-color-alt);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

/* 覆盖 Element Plus 默认的圆角和按钮风格，使其更硬朗高级 */
.el-button {
  border-radius: 6px !important;
  font-weight: 500;
}
.el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}
.el-input__wrapper {
  border-radius: 6px !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}
.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
}

/* 极简滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #cbd5e1;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>