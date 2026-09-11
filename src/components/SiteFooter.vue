<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="ftr">
    <div class="wrap ftr__inner">
      <div class="ftr__line" />
      <div class="ftr__body">
        <div class="ftr__brand kai">古文</div>
        <p class="ftr__note">
          一页一篇，注、译、析俱备。<br />
          纸短意长，聊供静夜一读。
        </p>
        <div class="ftr__meta">© {{ year }} · 本网站内容据历代通行版本整理，仅供学习欣赏</div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  margin-top: 80px;
  padding-bottom: 46px;
}

.ftr__line {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--line), transparent);
}

.ftr__body {
  padding-top: 34px;
  text-align: center;
}

.ftr__brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--paper);
  background: var(--cinnabar);
  border-radius: 2px;
  opacity: 0.85;
}

.ftr__note {
  font-size: 14px;
  line-height: 2;
  color: var(--ink-3);
}

.ftr__meta {
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--ink-3);
  opacity: 0.75;
}
</style>
