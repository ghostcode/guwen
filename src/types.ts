/** 夹注：正文中需要解释的字词 */
export interface Glossary {
  /** 被解释的词（须在段落原文中出现） */
  word: string
  /** 注文 */
  text: string
}

/** 一个自然段 */
export interface Paragraph {
  text: string
  /** 该段的白话译文 */
  translation?: string
  /** 该段的字词注释 */
  glossary?: Glossary[]
}

/** 一篇古文 */
export interface Article {
  /** 路由用的唯一标识，建议使用拼音 */
  id: string
  title: string
  /** 别名，如「前赤壁赋」 */
  alias?: string
  author: string
  dynasty: string
  /** 体裁：记 / 序 / 赋 / 说 / 铭 / 表 / 论 / 书 / 蒙学 */
  genre: string
  /** 出处，如《范文正公集》 */
  source?: string
  /** 写作年代或背景说明 */
  era?: string
  /** 题解 */
  lead: string
  /** 传世名句 */
  famousQuote?: string
  paragraphs: Paragraph[]
  /** 赏析，多段 */
  appreciation?: string[]
  /** 主题标签 */
  tags?: string[]
}

export type ThemeName = 'xuan' | 'ye' | 'zhu'
export type LayoutMode = 'horizontal' | 'vertical'
