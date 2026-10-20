/**
 * NumberField — 可编辑数字输入（内联编辑 + 方向键微调）。
 * 将用户输入约束在 [min, max]，精度由 precision 控制。
 */
import { useState, useEffect } from 'react'
import type { FC } from 'react'

interface Props {
  value: number
  min: number
  max: number
  step?: number
  precision?: number
  onChange: (v: number) => void
}

const baseStyle: Record<string, unknown> = {
  width: 48,
  padding: '3px 6px',
  fontSize: 12,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  color: '#e8e8f0',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 4,
  outline: 'none',
  boxSizing: 'border-box',
  cursor: 'text',
  transition: 'background 100ms, border-color 100ms',
}

export const NumberField: FC<Props> = ({ value, min, max, step = 1, precision = 0, onChange }) => {
  const [text, setText] = useState(() => String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => { if (!focused) setText(String(value)) }, [value, focused])

  const clamp = (v: number) => {
    let c = Math.max(min, Math.min(max, v))
    if (precision > 0) {
      const f = Math.pow(10, precision)
      c = Math.round(c * f) / f
    } else c = Math.round(c)
    return c
  }

  const commit = () => {
    const n = Number(text)
    if (!Number.isFinite(n)) { setText(String(value)); return }
    const v = clamp(n)
    setText(String(v))
    if (v !== value) onChange(v)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={e => setText(e.target.value)}
      onFocus={e => { setFocused(true); e.target.select() }}
      onBlur={() => { setFocused(false); commit() }}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur() }
        else if (e.key === 'Escape') { setText(String(value)); (e.target as HTMLInputElement).blur() }
        else if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step)) }
        else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step)) }
      }}
      style={{
        ...baseStyle,
        background: focused ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
        border: focused ? '1px solid #0969da' : '1px solid rgba(255,255,255,0.12)',
      }}
    />
  )
}