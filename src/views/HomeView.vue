<script setup lang="ts">
import { computed, ref } from 'vue'
import { articles, toChineseNumber } from '@/data'
import { useReadingStore } from '@/stores/reading'

const store = useReadingStore()

const keyword = ref('')
const genre = ref('全部')

const genreTabs = computed(() => [
  '全部',
  ...Array.from(new Set(articles.map((a) => a.genre))),
])

const filtered = computed(() => {
  const kw = keyword.value.trim()
  return articles.filter((a) => {
    const matchGenre = genre.value === '全部' || a.genre === genre.value
    if (!matchGenre) return false
    if (!kw) return true
    return (
      a.title.includes(kw) ||
      a.author.includes(kw) ||
      a.dynasty.includes(kw) ||
      (a.famousQuote ?? '').includes(kw) ||
      (a.tags ?? []).some((t) => t.includes(kw))
    )
  })
})

const bookmarkedArticles = computed(() =>
  store.bookmarks
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is (typeof articles)[number] => Boolean(a)),
)
</script>

<template>
  <div class="home">
    <!-- 卷首 -->
    <section class="wrap hero">
      <div class="hero__main">
        <p class="hero__eyebrow">中國歷代散文 · 辭賦 · 序跋</p>
        <h1 class="hero__title kai">古文</h1>
        <div class="hero__rule" />
        <p class="hero__sub">一页一篇，与古人相对</p>
        <p class="hero__desc">
          收录 {{ articles.length }} 篇，各附题解、夹注、白话与赏析。<br />
          可竖排展卷，可调字号，可听其声。
        </p>
        <RouterLink class="hero__start" :to="`/wen/${articles[0].id}`">开卷 →</RouterLink>
      </div>

      <aside class="hero__side" aria-hidden="true">
        <p class="hero__vertical kai">每有会意，便欣然忘食</p>
        <span class="hero__seal kai">读</span>
      </aside>
    </section>

    <!-- 书签 -->
    <section v-if="bookmarkedArticles.length" class="wrap shelf">
      <h2 class="shelf__title kai">我的藏书</h2>
      <div class="shelf__list">
        <RouterLink
          v-for="a in bookmarkedArticles"
          :key="a.id"
          class="chip"
          :to="`/wen/${a.id}`"
        >
          {{ a.title }}
          <span class="chip__author">{{ a.author }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- 目录 -->
    <section class="wrap catalogue">
      <div class="bar">
        <div class="bar__search">
          <span class="bar__icon">寻</span>
          <input v-model="keyword" type="search" placeholder="篇名、作者或名句" />
        </div>
        <div class="bar__tabs">
          <button
            v-for="g in genreTabs"
            :key="g"
            class="bar__tab"
            :class="{ 'is-on': genre === g }"
            @click="genre = g"
          >
            {{ g }}
          </button>
        </div>
      </div>

      <p class="count">共 {{ filtered.length }} 篇</p>

      <div v-if="filtered.length" class="grid">
        <RouterLink
          v-for="(a, i) in filtered"
          :key="a.id"
          class="card"
          :to="`/wen/${a.id}`"
        >
          <span class="card__no kai">{{ toChineseNumber(i + 1) }}</span>
          <h3 class="card__title kai">{{ a.title }}</h3>
          <p class="card__meta">{{ a.dynasty }} · {{ a.author }}</p>
          <p class="card__tag">{{ a.genre }}</p>
          <p v-if="a.famousQuote" class="card__quote">「{{ a.famousQuote }}」</p>
          <span class="card__arrow">→</span>
        </RouterLink>
      </div>

      <p v-else class="empty kai">无此篇，请另寻</p>
    </section>
  </div>
</template>

<style scoped>
/* ---------- 卷首 ---------- */
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 40px;
  padding-top: 88px;
  padding-bottom: 70px;
}

.hero__eyebrow {
  font-size: 11px;
  letter-spacing: 5px;
  color: var(--ink-3);
}

.hero__title {
  margin-top: 14px;
  font-size: clamp(64px, 12vw, 116px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 14px;
  text-indent: 14px;
  color: var(--ink);
}

.hero__rule {
  width: 120px;
  height: 1px;
  margin: 32px 0 22px;
  background: linear-gradient(to right, var(--cinnabar), transparent);
}

.hero__sub {
  font-family: var(--font-kai);
  font-size: 19px;
  letter-spacing: 5px;
  color: var(--ink-2);
}

.hero__desc {
  margin-top: 14px;
  font-size: 14px;
  line-height: 2;
  color: var(--ink-3);
}

.hero__start {
  display: inline-block;
  margin-top: 26px;
  padding: 9px 22px;
  font-family: var(--font-kai);
  font-size: 15px;
  letter-spacing: 3px;
  color: var(--cinnabar);
  border: 1px solid var(--cinnabar);
  border-radius: var(--radius);
  transition: all 0.3s var(--ease);
}

.hero__start:hover {
  color: var(--paper);
  background: var(--cinnabar);
}

.hero__side {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 18px;
}

.hero__vertical {
  writing-mode: vertical-rl;
  font-size: 17px;
  letter-spacing: 8px;
  color: var(--ink-3);
}

.hero__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-size: 18px;
  color: var(--paper);
  background: var(--cinnabar);
  border-radius: 2px;
  transform: rotate(2deg);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

/* ---------- 书签 ---------- */
.shelf {
  padding-bottom: 34px;
}

.shelf__title {
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 4px;
  color: var(--ink-2);
}

.shelf__list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 14px;
  color: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: all 0.28s var(--ease);
}

.chip:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
  background: var(--cinnabar-soft);
}

.chip__author {
  font-size: 11px;
  color: var(--ink-3);
}

/* ---------- 目录 ---------- */
.catalogue {
  padding-top: 6px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-soft);
}

.bar__search {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color 0.28s var(--ease);
}

.bar__search:focus-within {
  border-color: var(--cinnabar);
}

.bar__icon {
  font-family: var(--font-kai);
  font-size: 13px;
  color: var(--cinnabar);
}

.bar__search input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 14px;
  letter-spacing: 1px;
}

.bar__search input::placeholder {
  color: var(--ink-3);
}

.bar__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bar__tab {
  padding: 5px 12px;
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--ink-3);
  border-radius: var(--radius);
  transition: all 0.25s var(--ease);
}

.bar__tab:hover {
  color: var(--ink);
}

.bar__tab.is-on {
  color: var(--paper);
  background: var(--cinnabar);
}

.count {
  margin: 18px 0 22px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--ink-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.card {
  position: relative;
  display: block;
  padding: 24px 26px 26px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper-soft) 55%, transparent);
  transition: all 0.35s var(--ease);
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--cinnabar);
  transform: scaleY(0);
  transform-origin: 50% 100%;
  transition: transform 0.35s var(--ease);
}

.card:hover {
  border-color: var(--line);
  background: var(--paper-soft);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.card:hover::before {
  transform: scaleY(1);
  transform-origin: 50% 0;
}

.card__no {
  position: absolute;
  right: 18px;
  top: 14px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--ink-3);
  opacity: 0.5;
  transition: color 0.3s var(--ease);
}

.card:hover .card__no {
  color: var(--cinnabar);
  opacity: 0.85;
}

.card__title {
  font-size: 25px;
  font-weight: 400;
  letter-spacing: 3px;
  color: var(--ink);
}

.card__meta {
  margin-top: 10px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--ink-2);
}

.card__tag {
  display: inline-block;
  margin-top: 8px;
  padding: 0 7px;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--dai);
  border: 1px solid var(--line);
  border-radius: 2px;
}

.card__quote {
  margin-top: 16px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--ink-3);
}

.card__arrow {
  position: absolute;
  right: 20px;
  bottom: 18px;
  font-size: 15px;
  color: var(--cinnabar);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.35s var(--ease);
}

.card:hover .card__arrow {
  opacity: 1;
  transform: translateX(0);
}

.empty {
  padding: 70px 0;
  text-align: center;
  font-size: 17px;
  letter-spacing: 4px;
  color: var(--ink-3);
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 56px;
  }
  .hero__side {
    flex-direction: row;
    justify-content: flex-start;
  }
  .hero__vertical {
    writing-mode: horizontal-tb;
    letter-spacing: 3px;
  }
}
</style>
