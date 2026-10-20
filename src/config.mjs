/**
 * dsh-icon-grid · 配置（schemastery）。
 *
 * 单一命名空间 "dsh-icon-grid"，只有 iconGrid 一个子域。
 */

import z from '@deepseek-ai/schemastery'

export const SETTINGS_NS = 'dsh-icon-grid'

/** 子域默认值（唯一真相源） */
export const ICON_GRID_DEFAULTS = {
  /** 图标排列顺序（id 数组，空字符串 = 空槽） */
  order: [],
  /** 每行图标数 */
  cols: 8,
  /** 每列图标数 */
  rows: 12,
  /** 单个格子边长 px */
  cell: 46,
  /** 格子间距 px */
  gap: 6,
  /** 图标底色不透明度 */
  iconAlpha: 0.08,
  /** '' = 跟随明暗半透明；'#rrggbb' = 图标底色跟随该色 */
  gridAccent: '',
  /** 网格右边距 */
  marginRight: 24,
  /** 网格下边距 */
  marginBottom: 24,
  /** 是否显示网格线 */
  showGridLines: true,
  /** 网格线不透明度 */
  gridLineAlpha: 0.15,
}

const iconGrid = z.object({
  order: z.array(z.string()).default(ICON_GRID_DEFAULTS.order),
  cols: z.number().default(ICON_GRID_DEFAULTS.cols),
  rows: z.number().default(ICON_GRID_DEFAULTS.rows),
  cell: z.number().default(ICON_GRID_DEFAULTS.cell),
  gap: z.number().default(ICON_GRID_DEFAULTS.gap),
  iconAlpha: z.number().default(ICON_GRID_DEFAULTS.iconAlpha),
  gridAccent: z.string().default(ICON_GRID_DEFAULTS.gridAccent),
  marginRight: z.number().default(ICON_GRID_DEFAULTS.marginRight),
  marginBottom: z.number().default(ICON_GRID_DEFAULTS.marginBottom),
  showGridLines: z.boolean().default(ICON_GRID_DEFAULTS.showGridLines),
  gridLineAlpha: z.number().default(ICON_GRID_DEFAULTS.gridLineAlpha),
})

export const Config = z.object({ iconGrid })
Config.meta = Config.meta || {}
Config.meta.volatile = true

/** 默认配置（host / client / 测试共用的唯一真相源） */
export const DEFAULT_CONFIG = {
  iconGrid: { ...ICON_GRID_DEFAULTS },
}

/**
 * 把任意（可能残缺的）配置补全成完整配置。
 * 纯函数，host 落库、client 读取、单测都走这一条路径。
 * @param {any} raw
 */
export function normalizeConfig(raw) {
  const g = raw?.iconGrid ?? {}
  return {
    iconGrid: { ...ICON_GRID_DEFAULTS, ...g },
  }
}