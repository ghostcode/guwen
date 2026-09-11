<script setup lang="ts">
import { watchEffect } from 'vue'
import { useReadingStore } from '@/stores/reading'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const store = useReadingStore()

// 主题写到 <html data-theme>，由 CSS 变量驱动全站配色
watchEffect(() => {
  document.documentElement.dataset.theme = store.theme
})
</script>

<template>
  <div class="site">
    <SiteHeader />

    <main class="site__main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.site {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site__main {
  flex: 1;
}
</style>
