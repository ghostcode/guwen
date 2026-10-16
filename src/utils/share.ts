import type { Article } from '@/types'

/** 是否处于微信内置浏览器 */
export function isWeChat(): boolean {
  if (typeof navigator === 'undefined') return false
  return /micromessenger/i.test(navigator.userAgent)
}

/** 当前环境是否支持把图片写入剪贴板 */
export function isClipboardImageSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    typeof window !== 'undefined' &&
    typeof (window as unknown as { ClipboardItem?: unknown }).ClipboardItem !== 'undefined'
  )
}

/** 按像素宽度折行（兼容无空格的 CJK 文本） */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of Array.from(text)) {
    const test = line + ch
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  ch: string,
) {
  ctx.save()
  const r = 6
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + size, y, x + size, y + size, r)
  ctx.arcTo(x + size, y + size, x, y + size, r)
  ctx.arcTo(x, y + size, x, y, r)
  ctx.arcTo(x, y, x + size, y, r)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f4ecd8'
  ctx.font = `700 ${Math.round(size * 0.6)}px "KaiTi","STKaiti","SimSun",serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ch, x + size / 2, y + size / 2 + 2)
  ctx.restore()
}

/**
 * 把一篇古文绘制为竖版分享图（1080×1440，离线可生成）。
 * 配色固定为暖宣纸 + 朱砂，不随站点主题变化，保证分享图风格统一。
 */
export async function renderShareCanvas(article: Article): Promise<HTMLCanvasElement> {
  const W = 1080
  const H = 1440
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前环境不支持 canvas')

  const PAPER = '#f4ecd8'
  const INK = '#2b2722'
  const INK2 = '#5b5347'
  const INK3 = '#8a7f6b'
  const CIN = '#9b2e2e'

  // 纸底 + 极淡纤维噪点
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(120,100,70,${Math.random() * 0.04})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
  }

  // 双线边框
  ctx.strokeStyle = 'rgba(155,46,46,0.85)'
  ctx.lineWidth = 2
  ctx.strokeRect(34, 34, W - 68, H - 68)
  ctx.strokeStyle = 'rgba(155,46,46,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(48, 48, W - 96, H - 96)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cx = W / 2

  // 卷首朱印
  drawSeal(ctx, 76, 76, 66, CIN, '文')

  // 标题
  ctx.fillStyle = INK
  ctx.font = '700 84px "KaiTi","STKaiti","SimSun",serif'
  const titleLines = wrapText(ctx, article.title, W - 220)
  let y = 290
  const titleLh = 116
  for (const ln of titleLines) {
    ctx.fillText(ln, cx, y)
    y += titleLh
  }
  y += 6

  // 作者 / 朝代 / 出处
  ctx.fillStyle = INK2
  ctx.font = '400 36px "KaiTi","STKaiti","SimSun",serif'
  const byline = [article.dynasty, article.author, article.source].filter(Boolean).join('　')
  ctx.fillText(byline, cx, y)
  y += 64

  // 分隔（中缀菱形）
  const divY = y
  ctx.strokeStyle = 'rgba(155,46,46,0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 160, divY)
  ctx.lineTo(cx - 18, divY)
  ctx.moveTo(cx + 18, divY)
  ctx.lineTo(cx + 160, divY)
  ctx.stroke()
  ctx.fillStyle = CIN
  ctx.save()
  ctx.translate(cx, divY)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-7, -7, 14, 14)
  ctx.restore()
  y += 70

  // 名句
  const quote = article.famousQuote ? `「${article.famousQuote}」` : ''
  if (quote) {
    ctx.fillStyle = CIN
    ctx.font = '400 52px "KaiTi","STKaiti","SimSun",serif'
    for (const ln of wrapText(ctx, quote, W - 200)) {
      ctx.fillText(ln, cx, y)
      y += 82
    }
    y += 24
  }

  // 题解节选（至多两行）
  const excerpt = (article.lead || '').replace(/\s+/g, '')
  const excerptText = excerpt.length > 64 ? excerpt.slice(0, 64) + '…' : excerpt
  if (excerptText) {
    ctx.fillStyle = INK3
    ctx.font = '400 32px "KaiTi","STKaiti","SimSun",serif'
    let shown = 0
    for (const ln of wrapText(ctx, excerptText, W - 200)) {
      if (shown >= 2) break
      ctx.fillText(ln, cx, y)
      y += 56
      shown++
    }
  }

  // 页脚
  const footerY = H - 110
  ctx.strokeStyle = 'rgba(138,127,107,0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(76, footerY - 26)
  ctx.lineTo(W - 76, footerY - 26)
  ctx.stroke()
  drawSeal(ctx, 90, footerY - 12, 56, CIN, '古')
  ctx.fillStyle = INK3
  ctx.font = '400 30px "KaiTi","STKaiti","SimSun",serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('古文 · 一页一篇', 168, footerY + 16)
  ctx.textAlign = 'center'

  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('生成图片失败'))),
      type,
    )
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyBlobToClipboard(blob: Blob) {
  if (!isClipboardImageSupported()) throw new Error('当前环境不支持复制图片')
  const ClipboardItemCtor = (window as unknown as {
    ClipboardItem: new (items: Record<string, Blob>) => ClipboardItem
  }).ClipboardItem
  const item = new ClipboardItemCtor({ [blob.type || 'image/png']: blob })
  await navigator.clipboard.write([item])
}
