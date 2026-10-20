import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeGridLayout, detectTheme } from '../src/panel/helpers'

test('computeGridLayout 无 DOM 返回默认', () => {
  const out = computeGridLayout({
    cols: 8, rows: 12, cell: 46, gap: 6,
    marginRight: 24, marginBottom: 24,
  })
  assert.equal(out.renderCols, 8)
  assert.equal(out.renderRows, 12)
  assert.equal(out.left, null)
  assert.equal(out.bottomMargin, 24)
})

test('detectTheme 无 DOM 返回 light', () => {
  assert.equal(detectTheme(), 'light')
})