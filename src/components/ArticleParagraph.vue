<script setup lang="ts">
import { computed } from 'vue'
import type { Paragraph } from '@/types'

const props = defineProps<{
  paragraph: Paragraph
  index: number
  showGlossary: boolean
  showTranslation: boolean
}>()

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
</script>

<template>
  <div class="para">
    <p class="para__text">
      <template v-for="(tk, i) in tokens" :key="i">
        <span v-if="!tk.g">{{ tk.t }}</span>
        <template v-else>
          <span class="para__word">{{ tk.t }}</span><span class="para__gloss">（{{ tk.g }}）</span>
        </template>
      </template>
    </p>

    <p v-if="showTranslation && paragraph.translation" class="para__tr">
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
