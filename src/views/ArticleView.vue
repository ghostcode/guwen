<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getArticle, getNeighbors, toChineseNumber, articles } from '@/data'
import { useReadingStore } from '@/stores/reading'
import type { Article } from '@/types'
import ArticleParagraph from '@/components/ArticleParagraph.vue'
import ReadingToolbar from '@/components/ReadingToolbar.vue'
import InkDivider from '@/components/InkDivider.vue'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = useReadingStore()

const article = computed<Article | undefined>(() => getArticle(props.id))
const neighbors = computed(() => getNeighbors(props.id))
const bookmarked = computed(() => store.isBookmarked(props.id))

// 切换篇目时清空背诵填空进度，避免跨篇误显
watch(
  () => props.id,
  () => store.clearChars(),
)

const progress = ref(0)

function onScroll() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  progress.value = max > 0 ? Math.min(1, doc.scrollTop / max) : 0
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
})

/* ---------- 朗读 ---------- */
const speaking = ref(false)
const speechSupported = computed(() => typeof window !== 'undefined' && 'speechSynthesis' in window)

function toggleSpeech() {
  if (!article.value) return
  if (!speechSupported.value) return
  if (speaking.value) {
    window.speechSynthesis.cancel()
    speaking.value = false
    return
  }
  const text = article.value.paragraphs.map((p) => p.text).join('')
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = 0.82
  utter.onend = () => (speaking.value = false)
  utter.onerror = () => (speaking.value = false)
  window.speechSynthesis.speak(utter)
  speaking.value = true
}

function goRandom() {
  const pool = articles.filter((a) => a.id !== props.id)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  if (pick) router.push(`/wen/${pick.id}`)
}
</script>

<template>
  <div class="page">
    <!-- 阅读进度 -->
    <div class="progress" :style="{ transform: `scaleX(${progress})` }" />

    <div v-if="!article" class="wrap missing">
      <p class="missing__title kai">此篇未见</p>
      <p class="missing__text">未找到《{{ id }}》，或在别处。</p>
      <RouterLink to="/" class="btn">回到目录</RouterLink>
    </div>

    <div v-else class="wrap">
      <!-- 篇头 -->
      <header class="head">
        <div class="head__top">
          <RouterLink to="/" class="head__back">← 目录</RouterLink>
          <span class="head__genre">{{ article.genre }}</span>
        </div>

        <h1 class="head__title kai">{{ article.title }}</h1>

        <div class="head__byline">
          <span>{{ article.dynasty }} · {{ article.author }}</span>
          <span v-if="article.source" class="head__dot">·</span>
          <span v-if="article.source" class="head__source">{{ article.source }}</span>
        </div>

        <p v-if="article.era" class="head__era">{{ article.era }}</p>

        <div class="head__actions">
          <button
            class="mark"
            :class="{ 'mark--on': bookmarked }"
            @click="store.toggleBookmark(article.id)"
          >
            {{ bookmarked ? '已藏' : '藏书' }}
          </button>
          <button class="mark" @click="goRandom">随机</button>
        </div>

        <p class="head__lead">{{ article.lead }}</p>

        <p v-if="article.famousQuote" class="head__quote kai">「{{ article.famousQuote }}」</p>
      </header>

      <!-- 工具条 -->
      <ReadingToolbar :speaking="speaking" @toggle-speech="toggleSpeech" />

      <!-- 正文 -->
      <div
        class="body"
        :class="{ 'body--vertical': store.isVertical }"
        :style="{ '--fs-body': store.fontSize + 'px' }"
      >
        <ArticleParagraph
          v-for="(p, i) in article.paragraphs"
          :key="i"
          :paragraph="p"
          :index="i"
          :show-glossary="store.showGlossary"
          :show-translation="store.showTranslation"
        />
      </div>

      <p v-if="store.isVertical" class="vertical-tip">← 自右向左，横向滑动展卷</p>

      <!-- 赏析 -->
      <template v-if="article.appreciation?.length">
        <InkDivider label="赏析" />
        <section class="appr">
          <p v-for="(t, i) in article.appreciation" :key="i" class="appr__p">
            <span class="appr__no">{{ toChineseNumber(i + 1) }}</span>{{ t }}
          </p>
        </section>
      </template>

      <!-- 篇末 -->
      <div class="end">
        <span class="seal kai">{{ article.genre }}</span>
        <p class="end__meta">
          {{ article.dynasty }} · {{ article.author }}　{{ article.title }}
        </p>
      </div>

      <!-- 上下篇 -->
      <nav class="neighbor">
        <RouterLink
          v-if="neighbors.prev"
          class="neighbor__item neighbor__item--prev"
          :to="`/wen/${neighbors.prev.id}`"
        >
          <span class="neighbor__tag">上一篇</span>
          <span class="neighbor__title kai">{{ neighbors.prev.title }}</span>
          <span class="neighbor__author">{{ neighbors.prev.author }}</span>
        </RouterLink>
        <span v-else class="neighbor__item neighbor__item--empty" />

        <RouterLink
          v-if="neighbors.next"
          class="neighbor__item neighbor__item--next"
          :to="`/wen/${neighbors.next.id}`"
        >
          <span class="neighbor__tag">下一篇</span>
          <span class="neighbor__title kai">{{ neighbors.next.title }}</span>
          <span class="neighbor__author">{{ neighbors.next.author }}</span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: 40px;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  width: 100%;
  height: 2px;
  background: var(--cinnabar);
  transform-origin: 0 50%;
  transition: transform 0.12s linear;
}

/* ---------- 篇头 ---------- */
.head {
  max-width: var(--text-w);
  margin: 0 auto;
  padding-bottom: 30px;
  text-align: center;
}

.head__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 34px;
  font-size: 13px;
  color: var(--ink-3);
}

.head__back {
  letter-spacing: 2px;
  transition: color 0.25s var(--ease);
}

.head__back:hover {
  color: var(--cinnabar);
}

.head__genre {
  display: inline-block;
  padding: 1px 8px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--cinnabar);
  border: 1px solid var(--cinnabar);
  border-radius: 2px;
  opacity: 0.8;
}

.head__title {
  font-size: clamp(34px, 5.6vw, 52px);
  font-weight: 400;
  letter-spacing: 8px;
  text-indent: 8px;
  color: var(--ink);
}

.head__byline {
  margin-top: 18px;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--ink-2);
}

.head__dot {
  margin: 0 8px;
  color: var(--ink-3);
}

.head__source {
  color: var(--ink-3);
}

.head__era {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--ink-3);
}

.head__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.mark {
  padding: 5px 14px;
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: all 0.25s var(--ease);
}

.mark:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
}

.mark--on {
  color: var(--paper);
  background: var(--cinnabar);
  border-color: var(--cinnabar);
}

.head__lead {
  max-width: 560px;
  margin: 26px auto 0;
  font-size: 14.5px;
  line-height: 2.1;
  color: var(--ink-2);
  text-align: justify;
}

.head__quote {
  margin-top: 22px;
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--cinnabar);
  opacity: 0.9;
}

/* ---------- 工具条容器 ---------- */
:deep(.tb) {
  max-width: var(--text-w);
  margin: 26px auto 34px;
}

/* ---------- 正文 ---------- */
.body {
  max-width: var(--text-w);
  margin: 0 auto;
  padding: 30px 0 10px;
}

.body--vertical {
  writing-mode: vertical-rl;
  max-width: none;
  height: 72vh;
  padding: 26px 30px;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper-soft) 55%, transparent);
}

.vertical-tip {
  margin-top: 10px;
  font-size: 12px;
  letter-spacing: 2px;
  text-align: center;
  color: var(--ink-3);
}

/* ---------- 赏析 ---------- */
.appr {
  max-width: var(--text-w);
  margin: 0 auto;
}

.appr__p {
  position: relative;
  margin-bottom: 1.5em;
  padding-left: 2.4em;
  font-size: 16px;
  line-height: 2.15;
  color: var(--ink-2);
  text-align: justify;
}

.appr__no {
  position: absolute;
  left: 0;
  top: 0.35em;
  font-family: var(--font-kai);
  font-size: 14px;
  color: var(--cinnabar);
  opacity: 0.75;
}

/* ---------- 篇末 ---------- */
.end {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 56px;
}

.end__meta {
  font-size: 12.5px;
  letter-spacing: 2px;
  color: var(--ink-3);
}

/* ---------- 上下篇 ---------- */
.neighbor {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 54px;
}

.neighbor__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px 20px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  transition: all 0.3s var(--ease);
}

.neighbor__item--next {
  align-items: flex-end;
  text-align: right;
}

.neighbor__item:hover {
  border-color: var(--cinnabar);
  background: var(--cinnabar-soft);
}

.neighbor__item--empty {
  border: 0;
  pointer-events: none;
}

.neighbor__tag {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--ink-3);
}

.neighbor__title {
  font-size: 19px;
  letter-spacing: 2px;
  color: var(--ink);
}

.neighbor__author {
  font-size: 12px;
  color: var(--ink-3);
}

/* ---------- 缺失 ---------- */
.missing {
  padding: 120px 32px;
  text-align: center;
}

.missing__title {
  font-size: 30px;
  letter-spacing: 6px;
  color: var(--ink);
}

.missing__text {
  margin: 14px 0 26px;
  color: var(--ink-3);
}

@media (max-width: 640px) {
  .head__title {
    letter-spacing: 4px;
  }
  .neighbor {
    flex-direction: column;
  }
  .neighbor__item--next {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
