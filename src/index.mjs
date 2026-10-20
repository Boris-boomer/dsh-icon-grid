/**
 * dsh-icon-grid · Host 入口。
 */
import { Config, normalizeConfig, DEFAULT_CONFIG, SETTINGS_NS } from './config.mjs'
import { createUiState } from './lib/ui-state.mjs'
import { readNamespace } from './lib/settings.mjs'

export const name = 'dsh-icon-grid'

export { Config, normalizeConfig, DEFAULT_CONFIG, SETTINGS_NS }
export { createUiState } from './lib/ui-state.mjs'
export * from './lib/icons.mjs'

export function apply(ctx, config) {
  const readConfig = () => {
    const raw = config ?? DEFAULT_CONFIG
    if (raw && typeof raw.get === 'function') {
      try { return raw.get() ?? DEFAULT_CONFIG } catch { return DEFAULT_CONFIG }
    }
    return raw
  }
  const get = () => readConfig()
  const iconGrid = () => get()?.iconGrid ?? DEFAULT_CONFIG.iconGrid

  const ui = createUiState(get())

  const offBroadcast = ui.subscribe(s => {
    try { ctx.broadcast?.('dsh-icon-grid/state-changed', s) } catch { /* 忽略广播异常 */ }
  })

  ctx.inject(['settings', 'command'], (settings, command) => {
    const readNs = () => readNamespace(settings, SETTINGS_NS)

    readNs().then(ns => {
      if (!ns?.value) settings.update(SETTINGS_NS, normalizeConfig(get())).catch(() => { /* 忽略 */ })
    }).catch(() => { /* 忽略 */ })

    command('dsh-icon-grid', '查看图标网格状态').action(async () => {
      const ns = await readNs()
      const merged = normalizeConfig(ns?.value ?? get())
      return createUiState(merged).describeGrid()
    })

    command('dsh-icon-grid grid <cols> <rows>', '设置图标网格行列数')
      .action(async (_session, cols, rows) => {
        const c = Number(cols), r = Number(rows)
        if (!Number.isFinite(c) || !Number.isFinite(r) || c < 3 || c > 16 || r < 2 || r > 24) {
          return '❌ 用法: dsh-icon-grid grid <列 3-16> <行 2-24>'
        }
        const next = ui.update({ iconGrid: { cols: Math.round(c), rows: Math.round(r) } })
        try {
          const ns = await readNs()
          await settings.update(SETTINGS_NS, next, ns?.revision)
        } catch { /* client 端有 localStorage 兜底 */ }
        return `✅ 网格已设为 ${next.iconGrid.cols}×${next.iconGrid.rows}`
      })

    ctx.provide?.('dsh-icon-grid.config', { get, iconGrid, ui })
  })

  ctx.on?.('dispose', () => {
    try { offBroadcast?.() } catch { /* 忽略重复退订 */ }
  })
}