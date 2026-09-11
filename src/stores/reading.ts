import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { LayoutMode, ThemeName } from '@/types'

const STORE_KEY = 'guwen:preferences'

interface Preferences {
  theme: ThemeName
  layout: LayoutMode
  fontSize: number
  showGlossary: boolean
  showTranslation: boolean
  bookmarks: string[]
}

const DEFAULTS: Preferences = {
  theme: 'xuan',
  layout: 'horizontal',
  fontSize: 21,
  showGlossary: true,
  showTranslation: false,
  bookmarks: [],
}

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export const useReadingStore = defineStore('reading', () => {
  const saved = load()

  const theme = ref<ThemeName>(saved.theme)
  const layout = ref<LayoutMode>(saved.layout)
  const fontSize = ref(saved.fontSize)
  const showGlossary = ref(saved.showGlossary)
  const showTranslation = ref(saved.showTranslation)
  const bookmarks = ref<string[]>(saved.bookmarks)

  const isVertical = computed(() => layout.value === 'vertical')

  watch(
    [theme, layout, fontSize, showGlossary, showTranslation, bookmarks],
    () => {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          theme: theme.value,
          layout: layout.value,
          fontSize: fontSize.value,
          showGlossary: showGlossary.value,
          showTranslation: showTranslation.value,
          bookmarks: bookmarks.value,
        } satisfies Preferences),
      )
    },
    { deep: true },
  )

  function setTheme(next: ThemeName) {
    theme.value = next
  }
  function cycleTheme() {
    const order: ThemeName[] = ['xuan', 'ye', 'zhu']
    const idx = order.indexOf(theme.value)
    theme.value = order[(idx + 1) % order.length]
  }
  function toggleLayout() {
    layout.value = layout.value === 'horizontal' ? 'vertical' : 'horizontal'
  }
  function setFontSize(px: number) {
    fontSize.value = Math.min(30, Math.max(16, px))
  }
  function toggleBookmark(id: string) {
    const idx = bookmarks.value.indexOf(id)
    if (idx >= 0) bookmarks.value.splice(idx, 1)
    else bookmarks.value.unshift(id)
  }
  function isBookmarked(id: string) {
    return bookmarks.value.includes(id)
  }

  return {
    theme,
    layout,
    fontSize,
    showGlossary,
    showTranslation,
    bookmarks,
    isVertical,
    setTheme,
    cycleTheme,
    toggleLayout,
    setFontSize,
    toggleBookmark,
    isBookmarked,
  }
})
