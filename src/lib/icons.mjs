/**
 * 图标网格数据层（纯数据 + 纯函数，无 DSH 运行时依赖，可独立单测）。
 *
 * 网格本身不持有插件图标：外部插件把自己的图标推进 `window.__dshIconRegistry`，
 * 这里只负责"注册表 → 槽位"的纯计算，以及与主题共享的 CSS 变量解析。
 */

/** 槽位里的空位标记 */
export const EMPTY_SLOT = ''

/** 设置入口的固定 id（网格内始终存在的齿轮图标） */
export const SETTINGS_ENTRY_ID = '__dsh-icon-grid-settings__'

/** 内建条目：由本插件自己注册进网格，不需要外部插件提供 */
export const BUILTIN_ENTRIES = [
  {
    id: SETTINGS_ENTRY_ID,
    icon: '⚙️',
    label: '图标网格设置',
    builtin: true,
  },
]

/**
 * 读取全局注册表（外部插件推入的图标）。
 * 无 window 时返回空数组，保证模块可在 Node 下单测。
 *
 * 过滤非法条目，避免外部插件传错类型把 Grid 渲染崩掉：
 *   - id 必须是非空字符串
 *   - icon 必须是 string 或 number（不允许 React 元素/对象）
 *   - onClick / onUnload 若存在，必须是函数
 *
 * @returns {any[]}
 */
export function readRegistry(win = typeof window === 'undefined' ? undefined : window) {
  const reg = win?.__dshIconRegistry
  if (!Array.isArray(reg)) return []
  return reg.filter(e =>
    e && typeof e === 'object'
    && typeof e.id === 'string' && e.id
    && (typeof e.icon === 'string' || typeof e.icon === 'number')
    && (e.onClick === undefined || typeof e.onClick === 'function')
    && (e.onUnload === undefined || typeof e.onUnload === 'function')
  )
}

/**
 * 内建条目 + 外部注册条目。
 * 内建始终在前（顺序稳定）；外部按 `weight` 降序排列（大在前），
 * 相同 weight 保持注册顺序。返回新数组，不修改原始注册表。
 *
 * @param {any} [win]
 */
export function allEntries(win) {
  const external = readRegistry(win).slice()
  external.sort((a, b) => {
    const wa = Number.isFinite(a?.weight) ? a.weight : 0
    const wb = Number.isFinite(b?.weight) ? b.weight : 0
    return wb - wa
  })
  return [...BUILTIN_ENTRIES, ...external]
}

/**
 * 把持久化的 order 数组摊平成定长槽位数组。
 * 长度不足补 null，超长截断；空白串视为空槽。
 * @param {string[]} order
 * @param {number} count
 * @returns {(string | null)[]}
 */
export function slotsFromOrder(order, count) {
  const arr = /** @type {(string | null)[]} */ (Array(count).fill(null))
  const src = Array.isArray(order) ? order : []
  for (let i = 0; i < count && i < src.length; i++) {
    const v = src[i]
    arr[i] = typeof v === 'string' && v.trim() ? v : null
  }
  return arr
}

/** 槽位数组 → 持久化 order 数组 */
export function orderFromSlots(slots) {
  return slots.map(s => s ?? EMPTY_SLOT)
}

/**
 * 槽位重算：清掉已消失的 id，把新出现的 id 填进空槽。
 * 纯函数，返回新数组；无变化时返回原引用（便于 React 跳过渲染）。
 * @param {(string | null)[]} slots
 * @param {any[]} entries
 * @returns {(string | null)[]}
 */
export function reconcileSlots(slots, entries) {
  const ids = new Set(entries.map(e => e.id))
  const next = [...slots]
  let changed = false
  for (let i = 0; i < next.length; i++) {
    if (next[i] && !ids.has(next[i])) { next[i] = null; changed = true }
  }
  for (const entry of entries) {
    if (!next.includes(entry.id)) {
      const empty = next.indexOf(null)
      if (empty >= 0) { next[empty] = entry.id; changed = true }
    }
  }
  return changed ? next : slots
}

/**
 * 交换两个槽位（拖拽排序的最小单元）。越界/相同索引返回原引用。
 * @param {(string | null)[]} slots
 * @param {number} a
 * @param {number} b
 */
export function swapSlots(slots, a, b) {
  if (a === b || a < 0 || b < 0 || a >= slots.length || b >= slots.length) return slots
  const next = [...slots]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/**
 * 溢出计算：可见槽位不足时，最后一个可见格子换成 "+N"。
 * hiddenCount 统计从 `visibleSlots - 1`（+N 格所在位置）起的所有非空槽。
 * @param {(string | null)[]} slots 全量槽位
 * @param {number} visibleSlots 实际可渲染格子数（renderCols * renderRows）
 */
export function computeOverflow(slots, visibleSlots) {
  if (visibleSlots >= slots.length) {
    return { hiddenCount: 0, showPlusCell: false, displaySlots: slots }
  }
  const rest = slots.slice(visibleSlots - 1)
  const hiddenCount = rest.filter(s => s !== null).length
  if (hiddenCount > 0) {
    return { hiddenCount, showPlusCell: true, displaySlots: slots.slice(0, visibleSlots - 1) }
  }
  return { hiddenCount: 0, showPlusCell: false, displaySlots: slots.slice(0, visibleSlots) }
}

/**
 * 拖拽落点 → 目标索引（纯数学映射；可见区溢出的 "+N" 格保护由调用方
 * Grid.onPointerUp 在调用本函数之后手工处理）。
 * @returns {number}
 */
export function dropIndex(relX, relY, renderCols, renderRows, cell, gap) {
  const col = Math.max(0, Math.min(renderCols - 1, Math.floor(relX / (cell + gap))))
  const row = Math.max(0, Math.min(renderRows - 1, Math.floor(relY / (cell + gap))))
  return Math.max(0, row * renderCols + col)
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

/**
 * 网格配色：图标底色 / 网格线 / 图标颜色。
 *
 * 不查询皮肤 token 表，全部交给浏览器解析 CSS 变量（跟随 DSH 当前主题）。
 * 唯一的自定义输入是 `gridAccent`：
 *   - ''        → 用 rgba(ink, iconAlpha) 的半透明黑/白
 *   - '#rrggbb' → 用 color-mix(in srgb, accent N%, transparent)
 *
 * @param {{ gridAccent?: string, iconAlpha: number, gridLineAlpha: number, showGridLines: boolean }} config
 * @param {'light'|'dark'} resolvedTheme
 */
export function gridPalette(config, resolvedTheme) {
  const ink = resolvedTheme === 'dark' ? '255,255,255' : '0,0,0'
  const raw = typeof config.gridAccent === 'string' ? config.gridAccent.trim() : ''
  const accent = HEX_RE.test(raw) ? raw : null
  const pct = Math.round(config.iconAlpha * 100)
  return {
    inkRgb: ink,
    iconBg: accent
      ? `color-mix(in srgb, ${accent} ${pct}%, transparent)`
      : `rgba(${ink},${config.iconAlpha})`,
    iconBgDragging: accent
      ? `color-mix(in srgb, ${accent} ${Math.min(pct + 12, 35)}%, transparent)`
      : `rgba(${ink},${Math.min(config.iconAlpha + 0.12, 0.35)})`,
    gridLine: config.showGridLines
      ? `1px solid var(--dsw-alias-border-l1, rgba(${ink},${config.gridLineAlpha}))`
      : '1px solid transparent',
    iconColor: `var(--dsw-alias-label-primary, ${resolvedTheme === 'dark' ? '#e8e8f0' : '#222'})`,
    accent,
  }
}

/**
 * 插件的 cordis / DSH 名称。
 * 优先取 `plugin` 字段（约定），否则回退 `id`。
 * @param {any} entry
 */
export function pluginNameOf(entry) {
  if (entry && typeof entry.plugin === 'string') {
    const p = entry.plugin.trim()
    if (p) return p
  }
  return entry?.id
}

/**
 * 从 `window.__dshIconRegistry` 移除指定 id 的条目。
 * 返回是否移除成功（注册表不存在 / 未找到都返回 false）。
 * @param {string} id
 * @param {any} [win]
 */
export function removeFromRegistry(id, win = typeof window === 'undefined' ? undefined : window) {
  const reg = win?.__dshIconRegistry
  if (!Array.isArray(reg)) return false
  const idx = reg.findIndex(e => e?.id === id)
  if (idx < 0) return false
  reg.splice(idx, 1)
  return true
}

/**
 * 统一卸载一个注册条目。按以下顺序尝试：
 *   1. `window.__dshIconUnload(entry, name)`（集成层 / host 注入）
 *   2. `entry.onUnload()`（插件自带清理，向后兼容）
 * 都没有时返回 `{ ok: false, via: 'none' }`。不会抛异常。
 *
 * @param {any} entry
 * @param {any} [win]
 * @returns {Promise<{ ok: boolean, via: 'host' | 'onUnload' | 'none', msg: string }>}
 */
export async function unloadEntry(entry, win = typeof window === 'undefined' ? undefined : window) {
  const name = pluginNameOf(entry)

  const hook = win?.__dshIconUnload
  if (typeof hook === 'function') {
    try {
      const r = await hook(entry, name)
      if (r && r.ok === true) return { ok: true, via: 'host', msg: r.msg ?? '' }
      if (r && typeof r.msg === 'string') return { ok: false, via: 'host', msg: r.msg }
    } catch { /* 钩子失败 → 继续尝试 onUnload */ }
  }

  if (entry && typeof entry.onUnload === 'function') {
    try {
      await entry.onUnload()
      return { ok: true, via: 'onUnload', msg: '' }
    } catch (e) {
      const msg = e && typeof e.message === 'string' ? e.message : String(e)
      return { ok: false, via: 'onUnload', msg }
    }
  }

  return { ok: false, via: 'none', msg: 'no unload hook' }
}