/**
 * dsh-icon-grid 共享运行时状态（host / client 共用同一份实现）。
 */

import { normalizeConfig } from '../config.mjs'

/**
 * @param {any} rawConfig
 */
export function createUiState(rawConfig) {
  let state = normalizeConfig(rawConfig)
  /** @type {Set<(s: any) => void>} */
  const listeners = new Set()

  const snapshot = () => JSON.parse(JSON.stringify(state))

  const emit = () => {
    const s = snapshot()
    for (const fn of listeners) {
      try { fn(s) } catch { /* 监听者异常不影响状态机 */ }
    }
  }

  return {
    get: () => snapshot(),

    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },

    update(patch) {
      const next = normalizeConfig({
        iconGrid: { ...state.iconGrid, ...(patch?.iconGrid ?? {}) },
      })
      const changed = JSON.stringify(next) !== JSON.stringify(state)
      state = next
      if (changed) emit()
      return snapshot()
    },

    describeGrid() {
      const g = state.iconGrid
      return [
        `▦ 网格: ${g.cols}×${g.rows} · 格子 ${g.cell}px · 间距 ${g.gap}px`,
        `网格线: ${g.showGridLines ? '开' : '关'} · 深浅 ${g.gridLineAlpha}`,
        `图标底色: ${g.iconAlpha}${g.gridAccent ? ` · 主色 ${g.gridAccent}` : ''}`,
        `边距: 右 ${g.marginRight} / 下 ${g.marginBottom}`,
      ].join('\n')
    },
  }
}