/**
 * 面板纯辅助函数（无 React / DSH 运行时依赖，可独立单测）。
 *
 * 持久化走同一个 dsh-icon-grid 命名空间；localStorage 作为 DSH 写入失败时的兜底。
 * 首次启动会尝试从旧的 dsh-ui-config 迁移 iconGrid，迁移后删旧 key。
 */

import { normalizeConfig, DEFAULT_CONFIG, SETTINGS_NS } from '../config.mjs'
import { pickNamespace } from '../lib/settings.mjs'

export const LOCAL_KEY = 'dsh-icon-grid-config'
export const PANEL_POS_KEY = 'dsh-icon-grid-panel-pos'
const LEGACY_LOCAL_KEY = 'dsh-ui-config'

export { normalizeConfig, DEFAULT_CONFIG, SETTINGS_NS, pickNamespace }

// ---------- localStorage 兜底 ----------

function ls(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

export function loadLocalConfig(): Record<string, any> | null {
  try {
    const raw = ls()?.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? normalizeConfig(parsed) : null
  } catch { return null }
}

export function saveLocalConfig(config: Record<string, any>): boolean {
  try {
    ls()?.setItem(LOCAL_KEY, JSON.stringify(normalizeConfig(config)))
    return true
  } catch { return false }
}

/**
 * 读本地配置；新 key 没有时尝试从旧 dsh-ui-config 迁移 iconGrid。
 * 迁移成功后删旧 key，避免每次启动都重跑。
 */
export function loadLocalConfigWithMigration(): Record<string, any> | null {
  const cur = loadLocalConfig()
  if (cur) return cur
  try {
    const raw = ls()?.getItem(LEGACY_LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.iconGrid) return null
    const migrated = normalizeConfig({ iconGrid: parsed.iconGrid })
    saveLocalConfig(migrated)
    try { ls()?.removeItem(LEGACY_LOCAL_KEY) } catch { /* 忽略 */ }
    return migrated
  } catch { return null }
}

export function loadPanelPos(): { x: number; y: number } | null {
  try {
    const raw = ls()?.getItem(PANEL_POS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return (p && typeof p.x === 'number' && typeof p.y === 'number') ? p : null
  } catch { return null }
}

export function savePanelPos(p: { x: number; y: number }): void {
  try { ls()?.setItem(PANEL_POS_KEY, JSON.stringify(p)) } catch { /* 忽略 */ }
}

// ---------- DSH settings ----------

/** DSH settings → 完整配置（null = 失败或不存在） */
export async function readConfigFromDsh(
  settingsSvc: any,
): Promise<{ config: Record<string, any>; revision?: number } | null> {
  try {
    const entry = pickNamespace(await settingsSvc.describe(), SETTINGS_NS)
    const value = entry?.value
    if (!value || typeof value !== 'object') return null
    return { config: normalizeConfig(value), revision: entry?.revision }
  } catch { return null }
}

/** 写 DSH settings（无条件写，避免 revision 竞态导致回弹），返回 {ok, msg} */
export async function writeConfigToDsh(
  settingsSvc: any,
  config: Record<string, any>,
): Promise<{ ok: boolean; msg: string }> {
  try {
    const update = await settingsSvc.update(SETTINGS_NS, normalizeConfig(config), undefined)
    if (update?.ok) return { ok: true, msg: '' }
    return { ok: false, msg: typeof update?.error === 'string' ? update.error : update?.error?.message ?? 'unknown' }
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : String(e) }
  }
}

// ---------- 主题检测 ----------

export function detectTheme(): 'light' | 'dark' {
  try {
    if (typeof document === 'undefined') return 'light'
    const el = document.documentElement
    const body = document.body

    // 1. 优先读 DSH 原生打在 html/body 标签上的 data-theme
    const dataTheme = el.getAttribute('data-theme') || body.getAttribute('data-theme')
    if (dataTheme === 'dark' || dataTheme === 'light') return dataTheme

    // 2. 其次看 class 是否包含 dark
    if (el.classList.contains('dark') || body.classList.contains('dark')) return 'dark'
    if (el.classList.contains('light') || body.classList.contains('light')) return 'light'

    // 3. 查 CSS 变量里的 label-primary 亮度
    const labelColor = getComputedStyle(el).getPropertyValue('--dsw-alias-label-primary').trim()
    if (labelColor && labelColor.startsWith('#')) {
      const r = parseInt(labelColor.slice(1, 3), 16)
      const g = parseInt(labelColor.slice(3, 5), 16)
      const b = parseInt(labelColor.slice(5, 7), 16)
      if (!isNaN(r) && (r + g + b) / 3 < 128) return 'dark'
    }
    if (labelColor && labelColor.startsWith('rgb')) {
      const m = labelColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (m && (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 < 128) return 'dark'
    }

    // 4. 最终兜底
    let bg = getComputedStyle(body).backgroundColor
    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = getComputedStyle(el).backgroundColor
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return 'light'
    return (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 < 128 ? 'dark' : 'light'
  } catch { return 'light' }
}

// ---------- 布局计算 ----------

const GAP_BETWEEN_CHAT_AND_GRID = 24

/** 找聊天中心列内 maxWidth 居中的内容块，返回最大右边界 */
export function measureContentRight(centerCol: Element): number {
  let right = 0
  for (const el of centerCol.querySelectorAll('*')) {
    const s = getComputedStyle(el)
    const mw = parseFloat(s.maxWidth)
    if (!isFinite(mw) || mw < 400 || mw > 1400) continue
    const r = el.getBoundingClientRect()
    if (r.width < 400) continue
    if (r.right > right) right = r.right
  }
  return right
}

/** 计算输入框卡片上方需要保留的底部 margin */
export function measureBottomMargin(userMargin: number, gridLeft: number | null, gridWidth: number): number {
  try {
    const el = document.querySelector('[data-composer-card]')
    if (!el) return userMargin
    const rect = el.getBoundingClientRect()
    if (rect.height < 10) return userMargin
    if (gridLeft !== null && gridWidth > 0) {
      const gridRight = gridLeft + gridWidth
      if (gridLeft >= rect.right || gridRight <= rect.left) return userMargin
    }
    return Math.max(userMargin, Math.round(window.innerHeight - rect.top + 8))
  } catch { return userMargin }
}

/** 根据可用空间计算实际行列数 */
export function computeGridLayout(
  config: Record<string, any>,
): { left: number | null; bottomMargin: number; renderCols: number; renderRows: number } {
  if (typeof document === 'undefined') {
    return { left: null, bottomMargin: config.marginBottom, renderCols: config.cols, renderRows: config.rows }
  }
  const cc = document.querySelector('[class*="BynINW_centerCol"]')
  if (!cc) return { left: null, bottomMargin: config.marginBottom, renderCols: config.cols, renderRows: config.rows }

  const ccRect = cc.getBoundingClientRect()
  const contentRight = measureContentRight(cc)

  // 方案 A：网格贴聊天列右边
  if (contentRight > 0) {
    const left = Math.round(contentRight + GAP_BETWEEN_CHAT_AND_GRID)
    const rightLimit = Math.round(ccRect.right - 8)
    const maxW = Math.max(0, rightLimit - left)
    const g = config.gap
    const estCols = Math.max(1, Math.floor((maxW - 16 + g) / (config.cell + g)))
    const estGridW = estCols * config.cell + Math.max(0, estCols - 1) * g + 16
    const bottomMargin = measureBottomMargin(config.marginBottom, left, estGridW)
    const availH = Math.max(60, window.innerHeight - bottomMargin - 16 - 8)
    const maxRows = Math.max(1, Math.floor((availH + g) / (config.cell + g)))

    if (estCols >= 1 && maxW >= config.cell + 16) {
      return {
        left,
        bottomMargin,
        renderCols: Math.max(1, Math.min(config.cols, estCols)),
        renderRows: Math.max(1, Math.min(config.rows, maxRows)),
      }
    }
  }

  // 方案 B：网格贴右边
  const availW = Math.max(60, window.innerWidth - config.marginRight - 16 - 8)
  const g = config.gap
  const maxCols2 = Math.max(1, Math.floor((availW + g) / (config.cell + g)))
  const availH = Math.max(60, window.innerHeight - config.marginBottom - 16 - 8)
  const maxRows = Math.max(1, Math.floor((availH + g) / (config.cell + g)))
  return {
    left: null,
    bottomMargin: config.marginBottom,
    renderCols: Math.max(1, Math.min(config.cols, maxCols2)),
    renderRows: Math.max(1, Math.min(config.rows, maxRows)),
  }
}

/** 清掉旧版可能残留的聊天列样式覆盖（兼容 dsh-icon-grid / dsh-ui 时代的数据属性） */
export function cleanupLegacyChatOverrides(): void {
  if (typeof document === 'undefined') return
  const el = document.querySelector<HTMLElement>('[class*="BynINW_centerCol"]')
  if (!el) return
  const sel = '[data-dsh-icon-grid-aligned],[data-dsh-ui-aligned]'
  for (const child of el.querySelectorAll<HTMLElement>(sel)) {
    child.style.marginLeft = ''
    child.style.marginRight = ''
    delete child.dataset.dshIconGridAligned
    delete child.dataset.dshUiAligned
  }
  el.style.paddingRight = ''
}