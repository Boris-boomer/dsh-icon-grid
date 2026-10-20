/**
 * dsh-icon-grid · Client 入口（单一挂载路径）。
 */
import { createRoot } from 'react-dom/client'
import { Grid } from './panel/Grid'
import { normalizeConfig, DEFAULT_CONFIG, SETTINGS_NS } from './config.mjs'
import {
  loadLocalConfigWithMigration,
  saveLocalConfig,
  writeConfigToDsh,
  pickNamespace,
} from './panel/helpers'
import { createUiState } from './lib/ui-state.mjs'

export const inject = ['remote', 'remote.settings', 'theme']

let root: ReturnType<typeof createRoot> | null = null
let host: HTMLDivElement | null = null

function teardown() {
  if (root) {
    try { root.unmount() } catch { /* 已 unmount 或 React 内部告警，忽略 */ }
    root = null
  }
  if (host) {
    try { host.remove() } catch { /* 忽略 */ }
    host = null
  }
  if (typeof document !== 'undefined') {
    document.querySelectorAll('#dsh-icon-grid-root').forEach(el => {
      try { el.remove() } catch { /* 忽略 */ }
    })
  }
}

const LEGACY_SETTINGS_NS = 'dsh-ui'

async function readState(settingsSvc: any, uiState: any) {
  // 1. localStorage（含从旧 dsh-ui-config 的迁移）
  const local = loadLocalConfigWithMigration()
  if (local) return local

  // 2. 新命名空间
  try {
    const entry = pickNamespace(await settingsSvc?.describe(), SETTINGS_NS)
    if (entry?.value?.iconGrid) return normalizeConfig(entry.value)
  } catch { /* 回落到下一步 */ }

  // 3. 旧命名空间迁移：只搬 iconGrid，写回新 ns + localStorage
  try {
    const legacy = pickNamespace(await settingsSvc?.describe(), LEGACY_SETTINGS_NS)
    if (legacy?.value?.iconGrid) {
      const migrated = normalizeConfig({ iconGrid: legacy.value.iconGrid })
      saveLocalConfig(migrated)
      writeConfigToDsh(settingsSvc, migrated).catch(() => { /* 忽略 */ })
      return migrated
    }
  } catch { /* 忽略 */ }

  return uiState.get()
}

export function apply(ctx: any) {
  if (typeof document === 'undefined') return

  const hadResidue = !!document.getElementById('dsh-icon-grid-root')
  teardown()
  if (hadResidue) {
    console.warn('[dsh-icon-grid] 检测到上次挂载残留，已清理后重新挂载（若频繁出现请检查热重载或重复加载）')
  }

  const settingsSvc = ctx.remote?.settings
  const uiState = createUiState(DEFAULT_CONFIG)

  host = document.createElement('div')
  host.id = 'dsh-icon-grid-root'
  document.body.appendChild(host)
  root = createRoot(host)
  root.render(<Grid ctx={ctx} uiState={uiState} settingsSvc={settingsSvc} />)

  // 异步读配置：首帧渲染 DEFAULT_CONFIG，读完后 update uiState 由 Grid 的订阅刷新
  readState(settingsSvc, uiState).then(cfg => {
    if (!root) return
    uiState.update(cfg)
  }).catch(e => {
    console.error('[dsh-icon-grid] 读取状态失败:', e)
  })

  // host 广播 → 写进 uiState → Grid 的 subscribe 会刷新
  ctx.on?.('dsh-icon-grid/state-changed', (state: any) => {
    if (state && typeof state === 'object') uiState.update(state)
  })

  ctx.on?.('dispose', () => {
    teardown()
  })
}