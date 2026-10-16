<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Article } from '@/types'
import {
  renderShareCanvas,
  canvasToBlob,
  downloadBlob,
  copyBlobToClipboard,
  isWeChat,
  isClipboardImageSupported,
} from '@/utils/share'

const props = defineProps<{ article: Article | null; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const wechat = isWeChat()
const canCopy = isClipboardImageSupported()

const canvas = ref<HTMLCanvasElement | null>(null)
const previewUrl = ref('')
const loading = ref(false)
const error = ref('')
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(msg: string) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 1800)
}

/** 当前文章的分享链接 */
const link = ref('')
function buildLink(a: Article): string {
  const base = `${location.origin}${location.pathname}`
  return `${base}#/wen/${a.id}`
}

watch(
  () => [props.open, props.article] as const,
  async () => {
    if (!props.open || !props.article) return
    link.value = buildLink(props.article)
    loading.value = true
    error.value = ''
    previewUrl.value = ''
    canvas.value = null
    try {
      // 海报已内嵌该篇二维码（renderShareCanvas 内部合成）
      const c = await renderShareCanvas(props.article, link.value)
      canvas.value = c
      previewUrl.value = c.toDataURL('image/png')
    } catch {
      error.value = '生成图片失败，请重试'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

async function onDownload() {
  if (!canvas.value || !props.article) return
  try {
    const blob = await canvasToBlob(canvas.value)
    downloadBlob(blob, `${props.article.title}.png`)
    showToast('已开始下载')
  } catch {
    showToast('下载失败')
  }
}

async function onCopy() {
  if (!canvas.value) return
  try {
    const blob = await canvasToBlob(canvas.value)
    await copyBlobToClipboard(blob)
    showToast('已复制，可粘贴到聊天或文档')
  } catch {
    showToast('当前环境不支持复制图片')
  }
}

async function onCopyLink() {
  const url = link.value
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
      showToast('链接已复制')
    } else {
      throw new Error('clipboard-unavailable')
    }
  } catch {
    // 微信 / 非安全上下文：无法写剪贴板，提示长按复制
    showToast('请长按下方链接复制')
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="share-mask" @click.self="close">
      <div class="share" role="dialog" aria-modal="true">
        <div class="share__head">
          <span class="share__title kai">分享 · {{ article?.title }}</span>
          <button class="share__x" type="button" aria-label="关闭" @click="close">×</button>
        </div>

        <div class="share__body">
          <div v-if="loading" class="share__state kai">生成图片中…</div>
          <div v-else-if="error" class="share__state share__state--err">{{ error }}</div>
          <img v-else-if="previewUrl" :src="previewUrl" class="share__img" alt="分享图" />
        </div>

        <p v-if="wechat" class="share__hint">
          微信中请<span>长按上方图片</span>，选择「保存图片」或「发送给朋友」（图中已含二维码，扫码直达）
        </p>

        <!-- 链接 + 复制链接 -->
        <div class="share__link">
          <input
            class="share__link-input"
            type="text"
            readonly
            :value="link"
            @focus="($event.target as HTMLInputElement).select()"
          />
          <button class="share__link-btn" type="button" @click="onCopyLink">复制链接</button>
        </div>

        <!-- 操作按钮 -->
        <div class="share__acts">
          <button class="share__btn" type="button" :disabled="!canvas" @click="onDownload">
            下载图片
          </button>
          <button
            v-if="!wechat && canCopy"
            class="share__btn share__btn--ghost"
            type="button"
            :disabled="!canvas"
            @click="onCopy"
          >
            复制图片
          </button>
        </div>

        <Transition name="share-fade">
          <div v-if="toast" class="share__toast">{{ toast }}</div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.share-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(28, 22, 14, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.share {
  position: relative;
  width: min(420px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 18px 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper);
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.5);
}

.share__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.share__title {
  font-size: 16px;
  letter-spacing: 2px;
  color: var(--ink);
}

.share__x {
  width: 30px;
  height: 30px;
  font-size: 20px;
  line-height: 1;
  color: var(--ink-3);
  border: 1px solid var(--line);
  border-radius: 50%;
  transition: all 0.25s var(--ease);
}

.share__x:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
}

.share__body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 8px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper-soft) 50%, transparent);
}

.share__state {
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--ink-3);
}

.share__state--err {
  color: var(--cinnabar);
}

.share__img {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.4);
}

.share__hint {
  margin-top: 12px;
  padding: 9px 12px;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  text-align: center;
  color: var(--ink-2);
  background: var(--cinnabar-soft);
  border-radius: var(--radius);
}

.share__hint span {
  color: var(--cinnabar);
  font-weight: 600;
}

/* ---------- 链接行 ---------- */
.share__link {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.share__link-input {
  flex: 1;
  min-width: 0;
  padding: 9px 11px;
  font-size: 12.5px;
  letter-spacing: 0.3px;
  color: var(--ink-2);
  background: var(--paper-soft);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  outline: none;
}

.share__link-input:focus {
  border-color: var(--cinnabar);
}

.share__link-btn {
  flex-shrink: 0;
  padding: 0 16px;
  font-family: var(--font-kai);
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--cinnabar);
  background: transparent;
  border: 1px solid var(--cinnabar);
  border-radius: var(--radius);
  transition: all 0.25s var(--ease);
}

.share__link-btn:hover {
  background: var(--cinnabar-soft);
}

/* ---------- 操作按钮 ---------- */
.share__acts {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.share__btn {
  flex: 1;
  padding: 11px 0;
  font-family: var(--font-kai);
  font-size: 15px;
  letter-spacing: 3px;
  color: var(--paper);
  background: var(--cinnabar);
  border: 1px solid var(--cinnabar);
  border-radius: var(--radius);
  transition: all 0.25s var(--ease);
}

.share__btn:hover:not(:disabled) {
  filter: brightness(1.07);
}

.share__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.share__btn--ghost {
  color: var(--cinnabar);
  background: transparent;
}

.share__btn--ghost:hover:not(:disabled) {
  background: var(--cinnabar-soft);
}

/* ---------- toast ---------- */
.share__toast {
  position: absolute;
  left: 50%;
  bottom: 78px;
  transform: translateX(-50%);
  padding: 8px 16px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--paper);
  background: rgba(40, 30, 18, 0.92);
  border-radius: var(--radius);
  white-space: nowrap;
}

.share-fade-enter-active,
.share-fade-leave-active {
  transition: opacity 0.3s var(--ease);
}

.share-fade-enter-from,
.share-fade-leave-to {
  opacity: 0;
}
</style>
