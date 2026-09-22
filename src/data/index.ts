import type { Article } from '@/types'

import { daoDeJing1, daoDeJing8 } from './texts/daodejing'
import { kongQueDongNanFei } from './texts/kongque-dongnanfei'
import { mulanShi } from './texts/mulan-shi'
import { luoShengFu } from './texts/luoshen-fu'
import { dingFengBo } from './texts/ding-feng-bo'
import { quanXue } from './texts/quan-xue'
import { chuShiBiao } from './texts/chushi-biao'
import { lanTingJiXu } from './texts/lantingxu'
import { taoHuaYuan } from './texts/taohuayuan'
import { guiQuLaiXiCi } from './texts/guiqu-lai'
import { guiYuanTianJu } from './texts/guiyuan-tian-ju'
import { chunYeYan } from './texts/chunye-yan'
import { tengWangGeXu } from './texts/tengwang-ge-xu'
import { louShiMing } from './texts/loushi-ming'
import { xiaoShiTan } from './texts/xiaoshitan'
import { yueYangLou } from './texts/yueyanglou'
import { zuiWengTing } from './texts/zuiwengting'
import { aiLianShuo } from './texts/ailian-shuo'
import { jiChengTianSi } from './texts/chengtian-si'
import { qianChiBiFu } from './texts/chibi-fu'
import { sanZiJing } from './texts/sanzi-jing'
import { zengGuangXianWen } from './texts/zeng-guang-xian-wen'

/** 全站篇目，按时代先后排列 */
export const articles: Article[] = [
  daoDeJing1,
  daoDeJing8,
  quanXue,
  kongQueDongNanFei,
  mulanShi,
  luoShengFu,
  chuShiBiao,
  lanTingJiXu,
  taoHuaYuan,
  guiQuLaiXiCi,
  guiYuanTianJu,
  tengWangGeXu,
  chunYeYan,
  louShiMing,
  xiaoShiTan,
  yueYangLou,
  zuiWengTing,
  aiLianShuo,
  jiChengTianSi,
  dingFengBo,
  qianChiBiFu,
  sanZiJing,
  zengGuangXianWen,
]

export const articleMap: Record<string, Article> = articles.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<string, Article>,
)

/** 首页筛选用的体裁 */
export const genres: string[] = Array.from(new Set(articles.map((a) => a.genre)))

/** 首页筛选用的朝代 */
export const dynasties: string[] = Array.from(new Set(articles.map((a) => a.dynasty)))

export function getArticle(id: string): Article | undefined {
  return articleMap[id]
}

/** 上一篇 / 下一篇 */
export function getNeighbors(id: string): { prev?: Article; next?: Article } {
  const idx = articles.findIndex((a) => a.id === id)
  if (idx < 0) return {}
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  }
}

/** 汉字序号，用于篇目编号 */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

export function toChineseNumber(n: number): string {
  if (n <= 0) return '零'
  if (n < 10) return CN_NUM[n]
  if (n < 20) return `十${n % 10 === 0 ? '' : CN_NUM[n % 10]}`
  if (n < 100) {
    const ten = Math.floor(n / 10)
    return `${CN_NUM[ten]}十${n % 10 === 0 ? '' : CN_NUM[n % 10]}`
  }
  return String(n)
}
