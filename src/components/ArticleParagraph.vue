<script setup lang="ts">
import { computed } from 'vue'
import type { Paragraph } from '@/types'
import { useReadingStore } from '@/stores/reading'

const props = defineProps<{
  paragraph: Paragraph
  index: number
  showGlossary: boolean
  showTranslation: boolean
}>()

const store = useReadingStore()

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 把段落原文切分为「正文 / 待注词」的片段，用于显示夹注 */
function tokenize(text: string, words: { word: string; text: string }[]) {
  if (!words?.length) return [{ t: text, g: '' }]
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length)
  const map = new Map(sorted.map((w) => [w.word, w.text]))
  const re = new RegExp(`(${sorted.map((w) => escapeRegExp(w.word)).join('|')})`, 'g')
  return text
    .split(re)
    .filter((s) => s !== '')
    .map((s) => ({ t: s, g: map.get(s) ?? '' }))
}

const tokens = computed(() =>
  props.showGlossary
    ? tokenize(props.paragraph.text, props.paragraph.glossary ?? [])
    : [{ t: props.paragraph.text, g: '' }],
)

/* ---------- 背诵模式：逐字填空 ---------- */
const HAN = /[㐀-䶿一-鿿豈-﫿]/
function isHan(ch: string) {
  return HAN.test(ch)
}

/** 以 Unicode 码点切分原文（兼容生僻字） */
const chars = computed(() => Array.from(props.paragraph.text))

/** 某字符当前是否应显示原字 */
function cellRevealed(ci: number) {
  return store.isCharRevealed(props.index, ci)
}

/** 隐藏态占位符 */
const MASK = '＿'

function cellText(ch: string, ci: number) {
  if (!isHan(ch)) return ch // 标点 / 数字 / 字母始终显示
  return cellRevealed(ci) ? ch : MASK
}

function cellClass(ch: string, ci: number) {
  if (!isHan(ch)) return 'rcell rcell--punct'
  return cellRevealed(ci) ? 'rcell rcell--on' : 'rcell rcell--hidden'
}

function onCellClick(ch: string, ci: number) {
  if (!isHan(ch)) return
  store.toggleChar(props.index, ci)
}
</script>

<template>
  <div class="para">
    <!-- 背诵模式：遮字填空 -->
    <p v-if="store.reciteMode" class="para__text para__text--recite">
      <span
        v-for="(ch, ci) in chars"
        :key="ci"
        :class="cellClass(ch, ci)"
        @click="onCellClick(ch, ci)"
        >{{ cellText(ch, ci) }}</span
      >
    </p>

    <!-- 普通模式 -->
    <p v-else class="para__text">
      <template v-for="(tk, i) in tokens" :key="i">
        <span v-if="!tk.g">{{ tk.t }}</span>
        <template v-else>
          <span class="para__word">{{ tk.t }}</span><span class="para__gloss">（{{ tk.g }}）</span>
        </template>
      </template>
    </p>

    <p v-if="!store.reciteMode && showTranslation && paragraph.translation" class="para__tr">
      <span class="para__tr-tag">译</span>{{ paragraph.translation }}
    </p>
  </div>
</template>

<style scoped>
.para {
  margin-block-end: 1.5em;
}

.para__text {
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  letter-spacing: 0.06em;
  text-indent: 2em;
  text-align: justify;
  color: var(--ink);
}

/* ---------- 背诵模式逐字填空 ---------- */
.para__text--recite {
  text-indent: 2em;
}

.rcell {
  cursor: default;
  transition: color 0.2s var(--ease);
}

.rcell--punct {
  color: var(--ink-2);
}

.rcell--on {
  color: var(--ink);
}

.rcell--hidden {
  color: color-mix(in srgb, var(--cinnabar) 50%, var(--ink-3));
  cursor: pointer;
}

.rcell--hidden:hover {
  color: var(--cinnabar);
}

.para__word {
  color: var(--cinnabar);
  text-emphasis: dot;
  -webkit-text-emphasis: dot;
  text-emphasis-position: under right;
  -webkit-text-emphasis-position: under right;
}

.para__gloss {
  font-size: 0.62em;
  letter-spacing: 0;
  color: var(--cinnabar);
  opacity: 0.82;
}

.para__tr {
  margin-block-start: 0.85em;
  padding-inline-start: 2.6em;
  font-size: calc(var(--fs-body) * 0.72);
  line-height: 1.95;
  color: var(--ink-3);
  text-align: justify;
}

.para__tr-tag {
  display: inline-block;
  margin-inline-end: 0.6em;
  padding: 0 0.35em;
  font-size: 0.85em;
  color: var(--cinnabar);
  border: 1px solid var(--cinnabar);
  border-radius: 2px;
  opacity: 0.8;
}
</style>
