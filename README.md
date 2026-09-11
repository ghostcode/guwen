# 古文 · 一页一篇

一个以「一页一篇」为核心理念的古典古文阅读网站。宣纸为底、墨色为骨、朱砂为点缀，提供夹注、白话译文、竖排展卷、朗读与书签等贴近传统阅读习惯的功能。纯前端实现，不依赖任何后端与外部资源（字体与质感均在本地生成），可完全离线浏览。

## 特性

- **一页一篇**：每篇古文独立成页，含「题解 → 原文（段内夹注）→ 白话译文 → 赏析」完整结构。
- **宣纸视觉**：三层质感（双层柔光渐变 + SVG 噪点纤维），楷体题、宋体文，朱砂仅用于印章、名句与重点。
- **三套主题**：宣纸（米黄，默认）/ 夜阑（深色）/ 青瓷（淡青），页头一键循环切换。
- **竖排展卷**：`writing-mode: vertical-rl` 自右向左横向滚动，配合 CSS 逻辑属性保证排版不错位。
- **夹注与译文**：逐段挂靠的字词注释（正文内小字双行夹注），可一键显隐；段内白话译文同样可开关。
- **朗读**：基于浏览器 Web Speech API（`zh-CN`，语速 0.82），离开页面自动停止。
- **藏书书签**：可将篇目收藏至「我的藏书」，偏好持久化于 `localStorage`。
- **随机一篇 / 上下篇导航 / 阅读进度条**。
- **目录与检索**：首页支持按篇名、作者、名句、标签搜索，按体裁筛选，汉字序号卡片式呈现。
- **完全离线**：不引用任何外部字体或图片 CDN，断网可用。

## 技术栈

| 维度 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + TypeScript） |
| 构建 | Vite 6 |
| 路由 | Vue Router 4（hash 模式，便于静态部署） |
| 状态 | Pinia 2（阅读偏好持久化） |
| 样式 | 原生 CSS 变量驱动主题，无 UI 组件库 |
| 类型检查 | `vue-tsc` |

## 快速开始

### 环境要求

- Node.js **18+**（推荐 20+）
- npm 9+

### 安装依赖

```bash
npm install
# 若网络受限，可使用镜像：
npm install --registry=https://registry.npmmirror.com
```

### 本地开发

```bash
npm run dev
```

启动后访问 <http://127.0.0.1:5173/>。

### 构建与预览

```bash
npm run build      # 类型检查 + 生产构建，产物输出至 dist/
npm run preview    # 本地预览构建产物
npm run typecheck  # 仅类型检查
```

## 目录结构

```
guwen/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts                 # 应用入口
    ├── App.vue                 # 根组件（含页头/页脚插槽）
    ├── types.ts                # Article / Paragraph / Glossary 类型
    ├── router/
    │   └── index.ts            # 路由表（首页 + /wen/:id 阅读页）
    ├── stores/
    │   └── reading.ts          # 阅读偏好（主题/排版/字号/夹注/译文/书签）
    ├── styles/
    │   └── base.css            # 全局变量、三主题、宣纸质感、竖排
    ├── data/
    │   ├── index.ts            # articles（按时代排序）、articleMap、检索工具
    │   └── texts/              # 一篇一文件（详见下方篇目）
    ├── components/
    │   ├── SiteHeader.vue      # 页头 + 主题切换
    │   ├── SiteFooter.vue
    │   ├── InkDivider.vue      # 朱砂分隔（用于「赏析」等标题）
    │   ├── ReadingToolbar.vue  # 字号/竖排/夹注/译文/朗读工具条
    │   └── ArticleParagraph.vue# 单段渲染（夹注分词、译文）
    └── views/
        ├── HomeView.vue        # 目录 / 搜索 / 体裁筛选 / 藏书
        ├── ArticleView.vue     # 阅读页（一页一篇）
        └── NotFoundView.vue
```

## 篇目一览

共 18 篇，按时代排序：

| # | 篇名 | 作者 | 朝代 | 体裁 |
| --- | --- | --- | --- | --- |
| 一 | 道德经 · 第一章 | 老子 | 先秦 | 哲 |
| 二 | 道德经 · 第八章 | 老子 | 先秦 | 哲 |
| 三 | 劝学 | 荀子 | 先秦 | 论 |
| 四 | 孔雀东南飞 | 佚名（汉乐府民歌） | 汉 | 乐府 |
| 五 | 木兰诗 | 佚名（北朝乐府民歌） | 北朝 | 乐府 |
| 六 | 出师表 | 诸葛亮 | 三国·蜀 | 表 |
| 七 | 兰亭集序 | 王羲之 | 东晋 | 序 |
| 八 | 桃花源记 | 陶渊明 | 东晋 | 记 |
| 九 | 归去来兮辞 | 陶渊明 | 东晋 | 辞 |
| 十 | 春夜宴从弟桃花园序 | 李白 | 唐 | 序 |
| 十一 | 陋室铭 | 刘禹锡 | 唐 | 铭 |
| 十二 | 小石潭记 | 柳宗元 | 唐 | 记 |
| 十三 | 岳阳楼记 | 范仲淹 | 宋 | 记 |
| 十四 | 醉翁亭记 | 欧阳修 | 宋 | 记 |
| 十五 | 爱莲说 | 周敦颐 | 宋 | 说 |
| 十六 | 记承天寺夜游 | 苏轼 | 宋 | 记 |
| 十七 | 前赤壁赋 | 苏轼 | 宋 | 赋 |
| 十八 | 三字经 · 节选 | 王应麟 | 宋 | 蒙学 |

## 阅读页功能说明

- **字号**：16–30px 无级调节。
- **竖排**：切换 `vertical-rl`，自右向左横向滚动，适合辞赋韵文。
- **夹注显隐**：按段内 `glossary` 的正则分词，在正文内以朱砂小字双行夹注呈现难点字词。
- **段内译文**：每段白话译文可独立开关。
- **朗读**：调用系统语音合成，朗读整篇原文。
- **藏书**：收藏至首页「我的藏书」区，状态存于 `localStorage`。
- **随机 / 进度 / 导航**：随机一篇基于全站 `articles` 数组；阅读进度条随页面滚动；篇末提供上一篇 / 下一篇跳转。

## 主题

通过 `<html data-theme="...">` 切换，全部样式由 CSS 变量驱动：

- `xuan` — 宣纸（米黄，默认）
- `ye` — 夜阑（深色）
- `zhu` — 青瓷（淡青）

主题选择记录在 `localStorage`（key：`guwen:preferences`）。

## 新增一篇古文

数据层采用「一文件一诗 + 集中登记」模式，新增篇目无需改动任何组件。

1. 在 `src/data/texts/` 下新建 `<id>.ts`，导出符合 `Article` 类型的常量：

   ```ts
   import type { Article } from '@/types'

   export const myArticle: Article = {
     id: 'my-article',
     title: '篇名',
     alias: '别名（可选）',
     author: '作者',
     dynasty: '朝代',
     genre: '体裁',            // 记 / 序 / 赋 / 说 / 铭 / 表 / 论 / 辞 / 乐府 / 蒙学 / 哲 …
     source: '出处（可选）',
     era: '写作年代或背景（可选）',
     lead: '题解',
     famousQuote: '传世名句（可选）',
     tags: ['标签一', '标签二'],
     paragraphs: [
       {
         text: '原文段落',
         translation: '白话译文（可选）',
         glossary: [
           { word: '待注词', text: '注文' },
         ],
       },
     ],
     appreciation: [
       '赏析段落一',
       '赏析段落二',
     ],
   }
   ```

2. 在 `src/data/index.ts` 顶部导入，并加入 `articles` 数组（按时代先后放置）：

   ```ts
   import { myArticle } from './texts/my-article'
   // ……
   export const articles: Article[] = [
     // ……
     myArticle,
     // ……
   ]
   ```

3. 完成。`goRandom`、首页搜索与体裁筛选会**自动**纳入新篇目，阅读页通过 `/wen/<id>` 直接访问。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（默认 127.0.0.1:5173） |
| `npm run build` | `vue-tsc` 类型检查后执行生产构建 |
| `npm run preview` | 预览 `dist/` 构建产物 |
| `npm run typecheck` | 仅执行类型检查 |

## 许可

本项目为个人学习/阅读用途，篇目文本取自公有领域古籍。如需转载或二次开发，请遵守相关著作权与署名规范。
