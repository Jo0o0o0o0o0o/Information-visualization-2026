<script setup lang="ts">
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="logo">
        <span class="logo-mark">TheDogs</span>
        <span class="logo-text">Information Visualization Lab</span>
      </div>

      <nav class="nav">
        <RouterLink class="link" to="/home">Overview</RouterLink>
        <RouterLink class="link" to="/compare">Comparison</RouterLink>
      </nav>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #fdfbf3;
  color: #222;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #fff159;
  background-color: #ffd900; /* 主体黄色 */
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.logo-mark {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.logo-text {
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  gap: 20px;
}

.link {
  position: relative;
  padding: 4px 0;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #333;
}

.link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background-color: #ffffff;
  transition: width 0.18s ease-out;
}

.link:hover::after {
  width: 100%;
}

.link.router-link-active {
  color: #111;
}

.link.router-link-active::after {
  width: 100%;
}

.main {
  /* 页面内容仅通过 padding 控制留白 */
  padding: 16px 24px 24px;
}
</style>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
}
</style>
