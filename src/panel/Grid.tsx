/**
 * Grid — 图标网格主组件。
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import type { FC } from 'react'
import { GridPanel, type PanelStatus } from './GridPanel'
import {
  DEFAULT_CONFIG, normalizeConfig,
  saveLocalConfig, writeConfigToDsh,
  detectTheme, computeGridLayout, cleanupLegacyChatOverrides,
} from './helpers'
import {
  allEntries, slotsFromOrder, orderFromSlots, reconcileSlots,
  swapSlots, computeOverflow, gridPalette, dropIndex,
  pluginNameOf, removeFromRegistry, unloadEntry,
} from '../lib/icons.mjs'

interface Props {
  ctx: any
  uiState?: any
  settingsSvc?: any
}

export const Grid: FC<Props> = ({ ctx, uiState, settingsSvc: settingsProp }) => {
  const settingsSvc = settingsProp ?? ctx.remote.settings

  const [entries, setEntries] = useState<any[]>(() => allEntries())
  const [config, setConfig] = useState<any>(() => uiState?.get?.() ?? DEFAULT_CONFIG)
  const [slots, setSlots] = useState<(string | null)[]>([])
  const [loaded, setLoaded] = useState(false)
  const [drag, setDrag] = useState<{ id: string; fromIdx: number; x: number; y: number } | null>(null)
  const [renderCols, setRenderCols] = useState(DEFAULT_CONFIG.iconGrid.cols)
  const [renderRows, setRenderRows] = useState(DEFAULT_CONFIG.iconGrid.rows)
  const [gridLeft, setGridLeft] = useState<number | null>(null)
  const [bottomMargin, setBottomMargin] = useState(DEFAULT_CONFIG.iconGrid.marginBottom)
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [detectedTheme, setDetectedTheme] = useState(() => detectTheme())
  const [status, setStatus] = useState<PanelStatus>({ kind: 'idle' })

  const gridRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef(slots)
  slotsRef.current = slots
  const configRef = useRef(config)
  configRef.current = config
  const renderColsRef = useRef(renderCols)
  renderColsRef.current = renderCols
  const renderRowsRef = useRef(renderRows)
  renderRowsRef.current = renderRows
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settingsSvcRef = useRef(settingsSvc)
  settingsSvcRef.current = settingsSvc
  const uiStateRef = useRef(uiState)
  uiStateRef.current = uiState

  const grid = config.iconGrid ?? DEFAULT_CONFIG.iconGrid
  const cell = grid.cell, gap = grid.gap
  const fullSlots = grid.cols * grid.rows

  const gridCols = grid.cols
  const gridRows = grid.rows
  const gridCell = grid.cell
  const gridGap = grid.gap
  const gridMarginRight = grid.marginRight
  const gridMarginBottom = grid.marginBottom

  useEffect(() => { cleanupLegacyChatOverrides() }, [])

  useEffect(() => {
    const update = () => setDetectedTheme(detectTheme())
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener?.('change', update)
    const t = setInterval(update, 1500)
    return () => { observer.disconnect(); media.removeEventListener?.('change', update); clearInterval(t) }
  }, [])

  const resolvedTheme = detectedTheme
  useEffect(() => {
    const onTheme = () => setDetectedTheme(detectTheme())
    ctx.on?.('theme/change', onTheme)
    return () => ctx.off?.('theme/change', onTheme)
  }, [ctx])

  // 订阅 uiState：host 广播 / CLI 改配置后，Grid 重新渲染 + 对齐 slots 长度
  useEffect(() => {
    if (!uiState?.subscribe) return
    const off = uiState.subscribe((cfg: any) => {
      if (!cfg?.iconGrid) return
      const next = normalizeConfig(cfg)
      configRef.current = next
      setConfig(next)
      const target = next.iconGrid.cols * next.iconGrid.rows
      setSlots(prev => (prev.length === target ? prev : slotsFromOrder(next.iconGrid.order, target)))
    })
    return () => { try { off?.() } catch { /* 忽略 */ } }
  }, [uiState])

  useEffect(() => {
    let raf = 0
    const recompute = () => {
      const layout = computeGridLayout({
        cols: gridCols,
        rows: gridRows,
        cell: gridCell,
        gap: gridGap,
        marginRight: gridMarginRight,
        marginBottom: gridMarginBottom,
      })
      setGridLeft(layout.left)
      setBottomMargin(layout.bottomMargin)
      setRenderCols(layout.renderCols)
      setRenderRows(layout.renderRows)
    }
    const schedule = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(recompute) }
    schedule()
    const t1 = setTimeout(recompute, 200)
    const t2 = setTimeout(recompute, 800)
    const t3 = setTimeout(recompute, 2000)
    window.addEventListener('resize', schedule)
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(schedule)
      const card = document.querySelector('[data-composer-card]')
      if (card) ro.observe(card)
      const cc = document.querySelector('[class*="BynINW_centerCol"]')
      if (cc) ro.observe(cc)
    } catch { /* ResizeObserver 不可用 */ }
    const attach = setInterval(() => {
      try {
        if (!ro) return
        const card = document.querySelector('[data-composer-card]')
        if (card) ro.observe(card)
        const cc2 = document.querySelector('[class*="BynINW_centerCol"]')
        if (cc2) ro.observe(cc2)
      } catch { /* 忽略 */ }
    }, 1000)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(attach)
      window.removeEventListener('resize', schedule)
      ro?.disconnect()
    }
  }, [gridCols, gridRows, gridCell, gridGap, gridMarginRight, gridMarginBottom])

  useEffect(() => {
    const tick = () => {
      const reg = allEntries()
      setEntries(prev => {
        if (prev.length === reg.length && prev.every((e, i) => e.id === reg[i]?.id)) return prev
        return [...reg]
      })
    }
    tick()
    const t = setInterval(tick, 300)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const saved = uiStateRef.current?.get?.() ?? DEFAULT_CONFIG
    const merged = normalizeConfig(saved)
    configRef.current = merged
    setConfig(merged)
    setSlots(slotsFromOrder(merged.iconGrid.order, merged.iconGrid.cols * merged.iconGrid.rows))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    setSlots(prev => {
      if (prev.length === fullSlots) return prev
      if (prev.length > fullSlots) return prev.slice(0, fullSlots)
      return [...prev, ...Array(fullSlots - prev.length).fill(null)]
    })
  }, [fullSlots, loaded])

  useEffect(() => {
    if (!loaded) return
    setSlots(prev => reconcileSlots(prev, entries))
  }, [entries, loaded])

  const performSave = useCallback(async (overrides?: Record<string, any>) => {
    const toSave = normalizeConfig({
      iconGrid: { ...configRef.current.iconGrid, ...(overrides?.iconGrid ?? {}), order: orderFromSlots(slotsRef.current) },
    })
    configRef.current = toSave
    uiState?.update?.(toSave)
    const localOk = saveLocalConfig(toSave)
    setStatus({ kind: 'saving' })
    const dshResult = await writeConfigToDsh(settingsSvc, toSave)
    const now = new Date().toLocaleTimeString()
    if (dshResult.ok) setStatus({ kind: 'saved', at: now, source: 'dsh' })
    else if (localOk) setStatus({ kind: 'saved', at: now, source: 'local' })
    else setStatus({ kind: 'error', msg: dshResult.msg || '写入失败' })
  }, [settingsSvc, uiState])

  const flushSave = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    performSave()
  }, [performSave])

  const updateGrid = useCallback((patch: Record<string, any>) => {
    const next = normalizeConfig({ ...configRef.current, iconGrid: { ...configRef.current.iconGrid, ...patch } })
    configRef.current = next
    setConfig(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { saveTimer.current = null; performSave() }, 400)
  }, [performSave])

  const PADDING = 8
  const onPointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    if (e.button !== 0) return
    const iconId = slotsRef.current[idx]
    if (!iconId) return
    if (!gridRef.current) return
    const c = configRef.current.iconGrid
    const rcols = renderColsRef.current
    const rect = gridRef.current.getBoundingClientRect()
    const col = idx % rcols
    const row = Math.floor(idx / rcols)
    const cellLeft = rect.left + PADDING + col * (c.cell + c.gap)
    const cellTop = rect.top + PADDING + row * (c.cell + c.gap)
    const offsetX = e.clientX - cellLeft
    const offsetY = e.clientY - cellTop
    const startX = e.clientX, startY = e.clientY
    let moved = false

    const onMove = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4) moved = true
      if (!moved) return
      setDrag({ id: iconId, fromIdx: idx, x: ev.clientX - offsetX, y: ev.clientY - offsetY })
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (moved && gridRef.current) {
        const rect2 = gridRef.current.getBoundingClientRect()
        const cc = configRef.current.iconGrid
        const rcols2 = renderColsRef.current
        const rrows2 = renderRowsRef.current
        const relX = ev.clientX - rect2.left - PADDING
        const relY = ev.clientY - rect2.top - PADDING
        let toIdx = dropIndex(relX, relY, rcols2, rrows2, cc.cell, cc.gap)
        const lastIdx = rcols2 * rrows2 - 1
        const visibleSlots = rcols2 * rrows2
        if (visibleSlots < cc.cols * cc.rows && slotsRef.current.slice(visibleSlots - 1).some(s => s !== null) && toIdx >= lastIdx) toIdx = lastIdx - 1
        if (toIdx !== idx) {
          const next = swapSlots(slotsRef.current, idx, toIdx)
          slotsRef.current = next
          setSlots(next)
          performSave({ iconGrid: { order: orderFromSlots(next) } })
        }
      }
      setDrag(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [performSave])

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    return () => { window.removeEventListener('click', close); window.removeEventListener('contextmenu', close) }
  }, [menu])

  const resetConfig = () => {
    const currentIds = slotsRef.current.filter(Boolean) as string[]
    const newCount = DEFAULT_CONFIG.iconGrid.cols * DEFAULT_CONFIG.iconGrid.rows
    const newSlots: (string | null)[] = Array(newCount).fill(null)
    for (let i = 0; i < currentIds.length && i < newCount; i++) newSlots[i] = currentIds[i]

    const next = normalizeConfig({
      iconGrid: { ...DEFAULT_CONFIG.iconGrid, order: orderFromSlots(newSlots) },
    })
    configRef.current = next
    setConfig(next)
    slotsRef.current = newSlots
    setSlots(newSlots)
    performSave()
  }

  /**
   * 统一卸载：宿主 runtime 优先 → __dshIconUnload → entry.onUnload。
   * 无论卸载是否成功，都从注册表 + 槽位移除，避免 reconcile 把图标填回来。
   */
  const handleUnload = useCallback(async (entry: any) => {
    const name = pluginNameOf(entry)
    let result: { ok: boolean; via: string; msg: string } = { ok: false, via: 'none', msg: '' }

    // 1) 优先走 host 暴露的 runtime 服务（client.tsx 里 inject 了 'remote'）
    try {
      const runtime = (ctx.remote as any)?.dshIconGridRuntime
      if (runtime?.unload) {
        const r = await runtime.unload(name)
        if (r?.ok) result = { ok: true, via: 'host', msg: r.msg ?? '' }
        else if (typeof r?.msg === 'string') result = { ok: false, via: 'host', msg: r.msg }
      }
    } catch (e: any) {
      result = { ok: false, via: 'host', msg: String(e?.message ?? e) }
    }

    // 2) 回退到 window.__dshIconUnload / entry.onUnload
    if (!result.ok) {
      try {
        const r = await unloadEntry(entry)
        if (r.ok) result = r
        else if (!result.msg) result = r
      } catch { /* 忽略 */ }
    }

    // 3) 从注册表 + 槽位移除（这一步保证图标不会在下次 tick 被 reconcileSlots 填回）
    removeFromRegistry(entry.id)
    const next = slotsRef.current.map(s => (s === entry.id ? null : s))
    slotsRef.current = next
    setSlots(next)
    performSave({ iconGrid: { order: orderFromSlots(next) } })
    setMenu(null)

    if (!result.ok && result.msg) {
      console.warn(`[dsh-icon-grid] 卸载 ${entry.id} 失败: ${result.msg}`)
    }
  }, [ctx, performSave])

  const visibleSlots = renderCols * renderRows
  const { hiddenCount, showPlusCell, displaySlots } = computeOverflow(slots, visibleSlots)
  const entries2 = entries

  const gridWidth = renderCols * cell + (renderCols - 1) * gap + 16
  const gridHeight = renderRows * cell + (renderRows - 1) * gap + 16
  const { iconBg, iconBgDragging, gridLine: gridLineBorder, iconColor } = gridPalette(grid, resolvedTheme)

  // 空状态引导：没有任何外部图标时，在第一个空槽显示半透明 ＋
  const noExternalIcons = entries2.every(e => e.builtin)
  const emptyHintIdx = noExternalIcons ? displaySlots.findIndex(s => s === null) : -1

  const draggingIcon = drag ? entries2.find(e => e.id === drag.id)?.icon : null
  const menuEntry = menu ? entries2.find(e => e.id === menu.id) : null
  const renderCount = showPlusCell ? visibleSlots : Math.min(displaySlots.length, visibleSlots)
  const positionStyle = gridLeft !== null ? { left: gridLeft } : { right: grid.marginRight }

  return (
    <>
      <div ref={gridRef} style={{
        position: 'fixed', ...positionStyle, bottom: bottomMargin, zIndex: 999990,
        width: gridWidth, height: gridHeight, display: 'grid',
        gridTemplateColumns: `repeat(${renderCols}, ${cell}px)`,
        gridTemplateRows: `repeat(${renderRows}, ${cell}px)`,
        gap, padding: PADDING, background: 'transparent', userSelect: 'none',
        boxSizing: 'border-box', pointerEvents: 'none',
      }}>
        {Array.from({ length: renderCount }).map((_, idx) => {
          if (showPlusCell && idx === visibleSlots - 1) {
            return (
              <div key="__plus__" title={`还有 ${hiddenCount} 个图标未显示，点击打开设置`}
                onClick={e => { e.stopPropagation(); setPanelOpen(true) }}
                style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, cursor: 'pointer', background: iconBg, border: gridLineBorder,
                  boxSizing: 'border-box', fontSize: Math.round(cell * 0.42), lineHeight: 1,
                  color: iconColor, fontWeight: 600, pointerEvents: 'auto' }}>
                +{hiddenCount}
              </div>
            )
          }
          const id = displaySlots[idx]
          const entry = id ? entries2.find(e => e.id === id) : null
          const isHidden = drag !== null && drag.fromIdx === idx
          if (!entry) {
            if (idx === emptyHintIdx) {
              return (
                <div key="empty-hint"
                  title="外部插件通过 window.__dshIconRegistry 注册图标；点 ⚙️ 打开设置"
                  style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10, background: iconBg, border: gridLineBorder,
                    boxSizing: 'border-box', fontSize: Math.round(cell * 0.4), lineHeight: 1,
                    color: iconColor, opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                  ＋
                </div>
              )
            }
            return <div key={`empty-${idx}`} style={{ width: cell, height: cell, borderRadius: 10, background: 'transparent', border: gridLineBorder, boxSizing: 'border-box' }} />
          }
          return (
            <div key={entry.id} title={entry.label}
              onPointerDown={e => onPointerDown(e, idx)}
              onContextMenu={e => {
                e.preventDefault()
                e.stopPropagation()
                if (entry.builtin) {
                  setPanelOpen(true)
                  return
                }
                setMenu({ x: e.clientX, y: e.clientY, id: entry.id })
              }}
              onClick={e => {
                if (drag) return
                e.stopPropagation()
                if (entry.builtin) setPanelOpen(v => !v)
                else entry.onClick?.()
              }}
              style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, cursor: 'grab', background: iconBg, border: gridLineBorder,
                boxSizing: 'border-box', transition: 'background 120ms',
                fontSize: Math.round(cell * 0.48), lineHeight: 1,
                color: iconColor,
                touchAction: 'none', pointerEvents: 'auto', visibility: isHidden ? 'hidden' : 'visible' }}>
              {entry.icon}
            </div>
          )
        })}
      </div>

      {drag && draggingIcon && (
        <div style={{
          position: 'fixed', left: drag.x, top: drag.y, width: cell, height: cell,
          zIndex: 999997, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10, background: iconBgDragging,
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)', transform: 'scale(1.1)',
          fontSize: Math.round(cell * 0.48), lineHeight: 1, color: iconColor,
          pointerEvents: 'none', boxSizing: 'border-box',
          border: gridLineBorder,
        }}>{draggingIcon}</div>
      )}

      {panelOpen && (
        <GridPanel
          config={config} status={status} bottomOffset={bottomMargin}
          onUpdateGrid={updateGrid}
          onClose={() => { flushSave(); setPanelOpen(false) }}
          onSave={flushSave}
          onReset={resetConfig}
        />
      )}

      {menu && menuEntry && (
        <div style={{
          position: 'fixed', left: menu.x, top: menu.y, zIndex: 999999,
          background: '#1e1e28', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          padding: '4px 0', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: 13, color: '#e8e8f0', pointerEvents: 'auto',
        }}>
          <div style={{ padding: '8px 14px', cursor: 'pointer' }}
            onClick={() => {
              if (menuEntry.builtin) setPanelOpen(true)
              else menuEntry.onClick?.()
              setMenu(null)
            }}>
            打开
          </div>
          {!menuEntry.builtin && (
            <div style={{ padding: '8px 14px', cursor: 'pointer', color: '#ff6b6b' }}
              onClick={() => { void handleUnload(menuEntry) }}>
              卸载插件
            </div>
          )}
        </div>
      )}
    </>
  )
}