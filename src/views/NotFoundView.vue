<script setup lang="ts">
import { articles } from '@/data'
</script>

<template>
  <div class="wrap nf">
    <p class="nf__code kai">四〇四</p>
    <h1 class="nf__title kai">此路不通</h1>
    <p class="nf__text">君所寻之页，或已散入烟云。</p>
    <div class="nf__links">
      <RouterLink to="/" class="btn">回到目录</RouterLink>
      <RouterLink :to="`/wen/${articles[0].id}`" class="btn">随便读一篇</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.nf {
  padding: 140px 32px;
  text-align: center;
}

.nf__code {
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--ink-3);
}

.nf__title {
  margin-top: 18px;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 8px;
  color: var(--ink);
}

.nf__text {
  margin-top: 14px;
  color: var(--ink-3);
}

.nf__links {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}
</style>
