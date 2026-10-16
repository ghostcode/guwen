import { ref, reactive } from 'vue'
import type { Article } from '@/types'

// 模块级单例：各页面共用同一份「分享中文章 + 弹窗开关」状态
const open = ref(false)
const article = ref<Article | null>(null)

export function useShare() {
  function openShare(a: Article) {
    article.value = a
    open.value = true
  }
  function close() {
    open.value = false
  }
  return reactive({ open, article, openShare, close })
}
