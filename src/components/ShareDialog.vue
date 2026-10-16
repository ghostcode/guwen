<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
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

/** 视图切换：图片 / 二维码 */
const view = ref<'image' | 'qr'>('image')

const canvas = ref<HTMLCanvasElement | null>(null)
const previewUrl = ref('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrUrl = ref('')
const imgLoading = ref(false)
const imgError = ref('')
const qrLoading = ref(false)
const qrError = ref('')
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
    view.value = 'image'
    link.value = buildLink(props.article)
    imgLoading.value = true
    imgError.value = ''
    previewUrl.value = ''
    canvas.value = null
    qrUrl.value = ''
    qrCanvas.value = null
    try {
      const c = await renderShareCanvas(props.article)
      canvas.value = c
      previewUrl.value = c.toDataURL('image/png')
    } catch {
      imgError.value = '生成图片失败，请重试'
    } finally {
      imgLoading.value = false
    }
  },
  { immediate: true },
)

async function ensureQr() {
  if (!props.article || qrUrl.value || qrLoading.value) return
  qrLoading.value = true
  qrError.value = ''
  try {
    const c = document.createElement('canvas')
    await QRCode.toCanvas(c, link.value, {
      margin: 2,
      width: 360,
      color: { dark: '#2b2014', light: '#f7f1e1' },
    })
    qrCanvas.value = c
    qrUrl.value = c.toDataURL('image/png')
  } catch {
    qrError.value = '二维码生成失败'
  } finally {
    qrLoading.value = false
  }
}

function switchView(v: 'image' | 'qr') {
  view.value = v
  if (v === 'qr') ensureQr()
}

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

async function onDownloadQr() {
  if (!qrCanvas.value || !props.article) return
  try {
    const blob = await canvasToBlob(qrCanvas.value)
    downloadBlob(blob, `${props.article.title}-二维码.png`)
    showToast('已开始下载')
  } catch {
    showToast('下载失败')
  }
}

async function onCopyQr() {
  if (!qrCanvas.value) return
  try {
    const blob = await canvasToBlob(qrCanvas.value)
    await copyBlobToClipboard(blob)
    showToast('已复制二维码，可粘贴到聊天或文档')
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

        <!-- 视图切换 -->
        <div class="share__tabs">
          <button
            class="share__tab"
            :class="{ 'share__tab--on': view === 'image' }"
            type="button"
            @click="switchView('image')"
          >
            图片
          </button>
          <button
            class="share__tab"
            :class="{ 'share__tab--on': view === 'qr' }"
            type="button"
            @click="switchView('qr')"
          >
            二维码
          </button>
        </div>

        <div class="share__body">
          <!-- 图片视图 -->
          <template v-if="view === 'image'">
            <div v-if="imgLoading" class="share__state kai">生成图片中…</div>
            <div v-else-if="imgError" class="share__state share__state--err">{{ imgError }}</div>
            <img v-else-if="previewUrl" :src="previewUrl" class="share__img" alt="分享图" />
          </template>
          <!-- 二维码视图 -->
          <template v-else>
            <div v-if="qrLoading" class="share__state kai">生成二维码中…</div>
            <div v-else-if="qrError" class="share__state share__state--err">{{ qrError }}</div>
            <img v-else-if="qrUrl" :src="qrUrl" class="share__qr" alt="二维码" />
          </template>
        </div>

        <p v-if="wechat && view === 'image'" class="share__hint">
          微信中请<span>长按上方图片</span>，选择「保存图片」或「发送给朋友」
        </p>
        <p v-else-if="wechat && view === 'qr'" class="share__hint">
          微信中请<span>长按上方二维码</span>，选择「保存到相册」或「发送给朋友」
        </p>

        <!-- 链接 + 复制链接 -->
        <div class="share__link">
          <input class="share__link-input" type="text" readonly :value="link" @focus="($event.target as HTMLInputElement).select()" />
          <button class="share__link-btn" type="button" @click="onCopyLink">复制链接</button>
        </div>

        <!-- 操作按钮（随视图变化） -->
        <div class="share__acts">
          <template v-if="view === 'image'">
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
          </template>
          <template v-else>
            <button class="share__btn" type="button" :disabled="!qrCanvas" @click="onDownloadQr">
              下载二维码
            </button>
            <button
              v-if="!wechat && canCopy"
              class="share__btn share__btn--ghost"
              type="button"
              :disabled="!qrCanvas"
              @click="onCopyQr"
            >
              复制二维码
            </button>
          </template>
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
  margin-bottom: 12px;
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

/* ---------- 视图切换 ---------- */
.share__tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper-soft);
}

.share__tab {
  flex: 1;
  padding: 7px 0;
  font-family: var(--font-kai);
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--ink-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: calc(var(--radius) - 3px);
  transition: all 0.25s var(--ease);
}

.share__tab--on {
  color: var(--paper);
  background: var(--cinnabar);
  border-color: var(--cinnabar);
}

/* ---------- 主体 ---------- */
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
  max-height: 56vh;
  border-radius: 4px;
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.4);
}

.share__qr {
  display: block;
  width: 220px;
  height: 220px;
  padding: 12px;
  background: #f7f1e1;
  border-radius: 8px;
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
