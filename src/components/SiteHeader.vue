<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useReadingStore } from '@/stores/reading'

const store = useReadingStore()
const scrolled = ref(false)

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 8
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

const THEME_LABEL: Record<string, string> = {
  xuan: '宣纸',
  ye: '夜阑',
  zhu: '青瓷',
}
</script>

<template>
  <header class="hdr" :class="{ 'hdr--scrolled': scrolled }">
    <div class="wrap hdr__inner">
      <RouterLink to="/" class="brand">
        <span class="brand__seal">古文</span>
        <span class="brand__text">
          <span class="brand__name kai">古文</span>
          <span class="brand__slogan">一页一篇 · 与古人相对</span>
        </span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/" class="nav__item">目录</RouterLink>
        <span class="nav__sep">·</span>
        <button class="nav__item nav__theme" @click="store.cycleTheme()">
          <span class="nav__dot" />
          {{ THEME_LABEL[store.theme] }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--paper) 82%, transparent);
  backdrop-filter: saturate(140%) blur(10px);
  transition: border-color 0.4s var(--ease), background-color 0.4s var(--ease);
}

.hdr--scrolled {
  border-bottom-color: var(--line);
}

.hdr__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.brand__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-family: var(--font-kai);
  font-size: 13px;
  line-height: 1.05;
  letter-spacing: 0.5px;
  color: var(--paper);
  background: var(--cinnabar);
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  transform: rotate(-1.5deg);
  writing-mode: vertical-rl;
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.brand__name {
  font-size: 19px;
  letter-spacing: 4px;
  color: var(--ink);
}

.brand__slogan {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--ink-3);
}

.nav {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: var(--ink-2);
}

.nav__item {
  letter-spacing: 2px;
  transition: color 0.25s var(--ease);
}

.nav__item:hover {
  color: var(--cinnabar);
}

.nav__item.router-link-exact-active {
  color: var(--cinnabar);
}

.nav__sep {
  color: var(--line);
}

.nav__theme {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 2px;
}

.nav__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--paper-soft);
}

[data-theme='xuan'] .nav__dot {
  background: #e8dcc0;
}
[data-theme='ye'] .nav__dot {
  background: #2c3133;
}
[data-theme='zhu'] .nav__dot {
  background: #cfdcd6;
}

@media (max-width: 640px) {
  .brand__slogan {
    display: none;
  }
}
</style>
