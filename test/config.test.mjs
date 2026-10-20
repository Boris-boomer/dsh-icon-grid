import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeConfig, DEFAULT_CONFIG, ICON_GRID_DEFAULTS } from '../src/config.mjs'

test('normalizeConfig({}) 等于 DEFAULT_CONFIG', () => {
  assert.deepEqual(normalizeConfig({}), DEFAULT_CONFIG)
})

test('normalizeConfig 补全残缺的 iconGrid', () => {
  const out = normalizeConfig({ iconGrid: { cols: 10 } })
  assert.equal(out.iconGrid.cols, 10)
  assert.equal(out.iconGrid.rows, ICON_GRID_DEFAULTS.rows)
  assert.equal(out.iconGrid.cell, ICON_GRID_DEFAULTS.cell)
  assert.equal(out.iconGrid.gridAccent, ICON_GRID_DEFAULTS.gridAccent)
})

test('gridAccent 默认是空字符串', () => {
  assert.equal(DEFAULT_CONFIG.iconGrid.gridAccent, '')
})

test('normalizeConfig 忽略皮肤子域', () => {
  const out = normalizeConfig({ skin: { activeSkin: 'tint' }, iconGrid: { cols: 5 } })
  assert.equal(out.iconGrid.cols, 5)
  assert.equal('skin' in out, false)
})