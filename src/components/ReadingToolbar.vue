<script setup lang="ts">
import { useReadingStore } from '@/stores/reading'

const props = defineProps<{ speaking: boolean }>()
const emit = defineEmits<{ toggleSpeech: [] }>()

const store = useReadingStore()
</script>

<template>
  <div class="tb">
    <div class="tb__group">
      <span class="tb__label">字</span>
      <button class="tb__btn" title="缩小字号" @click="store.setFontSize(store.fontSize - 2)">
        A－
      </button>
      <span class="tb__num">{{ store.fontSize }}</span>
      <button class="tb__btn" title="放大字号" @click="store.setFontSize(store.fontSize + 2)">
        A＋
      </button>
    </div>

    <span class="tb__sep" />

    <button
      class="tb__btn tb__btn--wide"
      :class="{ 'is-on': store.isVertical }"
      title="切换竖排 / 横排"
      @click="store.toggleLayout()"
    >
      {{ store.isVertical ? '横排' : '竖排' }}
    </button>

    <button
      class="tb__btn tb__btn--wide"
      :class="{ 'is-on': store.showGlossary }"
      title="显示 / 隐藏文中夹注"
      @click="store.showGlossary = !store.showGlossary"
    >
      夹注
    </button>

    <button
      class="tb__btn tb__btn--wide"
      :class="{ 'is-on': store.showTranslation }"
      title="显示 / 隐藏白话译文"
      @click="store.showTranslation = !store.showTranslation"
    >
      译文
    </button>

    <span class="tb__sep" />

    <button
      class="tb__btn tb__btn--wide"
      :class="{ 'is-on': props.speaking }"
      title="朗读全文"
      @click="emit('toggleSpeech')"
    >
      {{ props.speaking ? '止声' : '朗读' }}
    </button>
  </div>
</template>

<style scoped>
.tb {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper-soft) 70%, transparent);
}

.tb__group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tb__label {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--ink-3);
  margin-inline-end: 2px;
}

.tb__num {
  min-width: 22px;
  font-size: 12px;
  text-align: center;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.tb__btn {
  padding: 5px 10px;
  font-size: 13px;
  font-family: var(--font-kai);
  letter-spacing: 2px;
  color: var(--ink-2);
  border: 1px solid transparent;
  border-radius: var(--radius);
  transition: all 0.25s var(--ease);
}

.tb__btn--wide {
  min-width: 46px;
}

.tb__btn:hover {
  color: var(--cinnabar);
  border-color: var(--line);
}

.tb__btn.is-on {
  color: var(--paper);
  background: var(--cinnabar);
  border-color: var(--cinnabar);
}

.tb__sep {
  width: 1px;
  height: 16px;
  background: var(--line);
}
</style>
