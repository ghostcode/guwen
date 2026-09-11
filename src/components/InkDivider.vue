<script setup lang="ts">
/** 水墨分隔纹：细线 + 中间小菱形，呼应古籍版式中的界行 */
defineProps<{ label?: string }>()
</script>

<template>
  <div class="divider">
    <span class="divider__line" />
    <span class="divider__mark" />
    <span v-if="label" class="divider__label kai">{{ label }}</span>
    <span class="divider__mark" />
    <span class="divider__line" />
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 46px 0;
  user-select: none;
}

.divider__line {
  width: min(120px, 18vw);
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--line) 40%,
    var(--line) 60%,
    transparent
  );
}

.divider__mark {
  width: 4px;
  height: 4px;
  background: var(--cinnabar);
  opacity: 0.55;
  transform: rotate(45deg);
}

.divider__label {
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--ink-3);
  text-indent: 6px;
}
</style>
