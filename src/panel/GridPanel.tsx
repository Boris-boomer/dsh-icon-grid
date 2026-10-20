/**
 * GridPanel — dsh-icon-grid 统一设置面板
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import type { FC } from 'react'
import { NumberField } from './NumberField'
import { loadPanelPos, savePanelPos } from './helpers'

/**
 * 面板保存状态。用 discriminated union 表达，避免 `at` / `msg` 在不同 kind
 * 下的可选性歧义；`source` 明确限定 'dsh' | 'local'。
 */
export type PanelStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: string; source: 'dsh' | 'local' }
  | { kind: 'error'; msg: string }

interface Props {
  config: Record<string, any>
  status: PanelStatus
  bottomOffset: number
  onUpdateGrid: (patch: Record<string, any>) => void
  onClose: () => void
  onSave: () => void
  onReset: () => void
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export const GridPanel: FC<Props> = ({
  config, status, bottomOffset,
  onUpdateGrid, onClose, onSave, onReset,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => loadPanelPos())
  const [dragging, setDragging] = useState(false)

  const grid = config.iconGrid ?? {}
  const accentColor = HEX_RE.test(grid.gridAccent) ? grid.gridAccent : '#0969da'

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    setPos(prev => {
      if (!prev) return prev
      const x = Math.max(0, Math.min(window.innerWidth - rect.width, prev.x))
      const y = Math.max(0, Math.min(window.innerHeight - rect.height, prev.y))
      if (x !== prev.x || y !== prev.y) { savePanelPos({ x, y }); return { x, y } }
      return prev
    })
  }, [])

  const onHeaderPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    const w = rect.width, h = rect.height
    setDragging(true)
    let latest: { x: number; y: number } | null = null
    const onMove = (ev: PointerEvent) => {
      latest = {
        x: Math.max(0, Math.min(window.innerWidth - w, ev.clientX - offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - h, ev.clientY - offsetY)),
      }
      setPos(latest)
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (latest) savePanelPos(latest)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const gridAccentValue = HEX_RE.test(grid.gridAccent) ? grid.gridAccent : '#c5a468'
  const handlePickAccent = useCallback((value: string) => {
    onUpdateGrid({ gridAccent: value })
  }, [onUpdateGrid])
  const handleClearAccent = useCallback(() => {
    onUpdateGrid({ gridAccent: '' })
  }, [onUpdateGrid])

  const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' as const, gap: 12, padding: '6px 0' }
  const labelStyle: Record<string, unknown> = { fontSize: 12, color: '#c8c8d0', minWidth: 82 }
  const slider: Record<string, unknown> = { flex: 1, accentColor, height: 4, cursor: 'pointer', minWidth: 60 }
  const btn: Record<string, unknown> = { padding: '6px 14px', fontSize: 12, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e8e8f0', cursor: 'pointer' }

  let statusBg = 'rgba(255,255,255,0.06)', statusColor = '#c8c8d0', statusText = '未保存'
  if (status.kind === 'saving') {
    statusBg = 'rgba(255,200,0,0.12)'; statusColor = '#ffc800'; statusText = '保存中…'
  } else if (status.kind === 'saved') {
    statusBg = 'rgba(80,200,80,0.12)'; statusColor = '#4ec94e'
    statusText = `✓ 已保存 ${status.at} ${status.source === 'local' ? '（已写入本机）' : '（已写入 DSH）'}`
  } else if (status.kind === 'error') {
    statusBg = 'rgba(255,80,80,0.12)'; statusColor = '#ff6b6b'; statusText = `✗ 保存失败：${status.msg}`
  }

  const posStyle = pos ? { left: pos.x, top: pos.y } : { right: grid.marginRight, bottom: bottomOffset + 40 }

  return (
    <div ref={panelRef} style={{
      position: 'fixed', ...posStyle, zIndex: 999998, width: 340, padding: '12px 14px 14px',
      borderRadius: 12, background: 'rgba(28,28,36,0.96)', border: `1px solid ${accentColor}44`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', color: '#e8e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif', pointerEvents: 'auto',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div onPointerDown={onHeaderPointerDown} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none', touchAction: 'none',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>▦ 图标网格设置</span>
        <button onPointerDown={e => e.stopPropagation()} onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#c8c8d0', fontSize: 16, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: statusBg, color: statusColor, fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 }}>
        <span>{statusText}</span>
        <button onClick={onSave} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#e8e8f0', fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>立即保存</button>
      </div>

      {([
        ['列数',    'cols',             3, 16, 1,  0],
        ['行数',    'rows',             2, 24, 1,  0],
        ['格子大小', 'cell',            28, 80, 1,  0],
        ['格间距',   'gap',             0,  20, 1,  0],
        ['图标底色', 'iconAlpha',        0,  0.4, 0.01, 2],
        ['右边距',   'marginRight',      0,  120, 2,  0],
        ['下边距',   'marginBottom',     0,  120, 2,  0],
      ] as const).map(([label, key, min, max, s, prec]) => (
        <div style={row} key={key}>
          <span style={labelStyle}>{label}</span>
          <input type="range" min={min} max={max} step={s} value={grid[key]} onChange={e => onUpdateGrid({ [key]: Number(e.target.value) })} style={slider} />
          <NumberField value={grid[key]} min={min} max={max} step={s} precision={Number(prec)} onChange={v => onUpdateGrid({ [key]: v })} />
        </div>
      ))}

      <div style={{
        marginTop: 6, padding: '8px 10px', borderRadius: 8,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#c8c8d0' }}>图标主色</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={gridAccentValue}
              onChange={e => handlePickAccent(e.target.value)}
              title="选择主色后，图标底色用它着色；留空则跟随明暗半透明"
              style={{
                width: 28, height: 24, padding: 0, border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 4, background: 'transparent', cursor: 'pointer',
              }}
            />
            <button
              type="button"
              onClick={handleClearAccent}
              disabled={!grid.gridAccent}
              style={{
                ...btn, padding: '3px 8px', fontSize: 11,
                opacity: grid.gridAccent ? 1 : 0.4, cursor: grid.gridAccent ? 'pointer' : 'not-allowed',
              }}
            >清除</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#9a9aa8', marginTop: 6 }}>
          {grid.gridAccent ? `主色 ${grid.gridAccent}` : '不设主色时图标底色跟随明暗半透明'}
        </div>
      </div>

      <div style={row}>
        <span style={labelStyle}>网格线</span>
        <label style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!grid.showGridLines} onChange={e => onUpdateGrid({ showGridLines: e.target.checked })} style={{ accentColor, cursor: 'pointer' }} />
          <span style={{ fontSize: 12, color: '#c8c8d0' }}>显示</span>
        </label>
      </div>
      <div style={row}>
        <span style={labelStyle}>网格线深浅</span>
        <input type="range" min={0} max={0.5} step={0.01} value={grid.gridLineAlpha} onChange={e => onUpdateGrid({ gridLineAlpha: Number(e.target.value) })} style={slider} />
        <NumberField value={grid.gridLineAlpha} min={0} max={0.5} step={0.01} precision={2} onChange={v => onUpdateGrid({ gridLineAlpha: v })} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button style={btn} onClick={onReset}>重置默认</button>
        <button style={{ ...btn, background: accentColor, borderColor: accentColor }} onClick={onClose}>完成</button>
      </div>
    </div>
  )
}