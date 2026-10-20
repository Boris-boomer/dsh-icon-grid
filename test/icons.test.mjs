import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  slotsFromOrder, orderFromSlots, reconcileSlots, swapSlots,
  computeOverflow, dropIndex, gridPalette, allEntries, readRegistry,
  BUILTIN_ENTRIES, SETTINGS_ENTRY_ID,
} from '../src/lib/icons.mjs'

test('slotsFromOrder / orderFromSlots 往返', () => {
  const order = ['a', '', 'b', null, 'c']
  const slots = slotsFromOrder(order, 5)
  assert.deepEqual(slots, ['a', null, 'b', null, 'c'])
  assert.deepEqual(orderFromSlots(slots), ['a', '', 'b', '', 'c'])
})

test('slotsFromOrder 长度不足补 null / 超长截断', () => {
  assert.deepEqual(slotsFromOrder(['a'], 3), ['a', null, null])
  assert.deepEqual(slotsFromOrder(['a', 'b', 'c'], 2), ['a', 'b'])
})

test('reconcileSlots 清孤儿 + 填空槽', () => {
  const slots = ['a', 'gone', null]
  const entries = [{ id: 'a' }, { id: 'b' }]
  assert.deepEqual(reconcileSlots(slots, entries), ['a', 'b', null])
})

test('reconcileSlots 无变化返回原引用', () => {
  const slots = ['a', null]
  const entries = [{ id: 'a' }]
  assert.equal(reconcileSlots(slots, entries), slots)
})

test('swapSlots 交换两个槽位', () => {
  assert.deepEqual(swapSlots(['a', 'b', 'c'], 0, 2), ['c', 'b', 'a'])
})

test('swapSlots 越界/相同返回原引用', () => {
  const slots = ['a', 'b']
  assert.equal(swapSlots(slots, 0, 0), slots)
  assert.equal(swapSlots(slots, -1, 0), slots)
  assert.equal(swapSlots(slots, 0, 5), slots)
})

test('computeOverflow 全部可见', () => {
  const out = computeOverflow(['a', 'b'], 4)
  assert.deepEqual(out, { hiddenCount: 0, showPlusCell: false, displaySlots: ['a', 'b'] })
})

test('computeOverflow 有隐藏图标', () => {
  const out = computeOverflow(['a', 'b', 'c', 'd'], 3)
  assert.equal(out.showPlusCell, true)
  assert.equal(out.hiddenCount, 2)
  assert.deepEqual(out.displaySlots, ['a', 'b'])
})

test('computeOverflow 溢出位本身为空时不算隐藏', () => {
  const out = computeOverflow(['a', 'b', null, null, null], 3)
  assert.equal(out.showPlusCell, false)
  assert.equal(out.hiddenCount, 0)
  assert.deepEqual(out.displaySlots, ['a', 'b', null])
})

test('dropIndex 边界', () => {
  assert.equal(dropIndex(0, 0, 4, 3, 40, 10), 0)
  assert.equal(dropIndex(51, 0, 4, 3, 40, 10), 1)
  assert.equal(dropIndex(0, 51, 4, 3, 40, 10), 4)
  assert.equal(dropIndex(9999, 9999, 4, 3, 40, 10), 11)
})

test('gridPalette gridAccent 为空时用 rgba', () => {
  const out = gridPalette({ iconAlpha: 0.08, gridLineAlpha: 0.15, showGridLines: true, gridAccent: '' }, 'dark')
  assert.equal(out.iconBg, 'rgba(255,255,255,0.08)')
  assert.equal(out.accent, null)
})

test('gridPalette gridAccent 有效时用 color-mix', () => {
  const out = gridPalette({ iconAlpha: 0.08, gridLineAlpha: 0.15, showGridLines: true, gridAccent: '#c5a468' }, 'dark')
  assert.match(out.iconBg, /^color-mix\(in srgb, #c5a468 8%, transparent\)$/)
  assert.equal(out.accent, '#c5a468')
})

test('gridPalette iconColor 用 CSS 变量', () => {
  const out = gridPalette({ iconAlpha: 0.08, gridLineAlpha: 0.15, showGridLines: true, gridAccent: '' }, 'dark')
  assert.match(out.iconColor, /^var\(--dsw-alias-label-primary/)
})

test('gridPalette gridLine 用 CSS 变量', () => {
  const out = gridPalette({ iconAlpha: 0.08, gridLineAlpha: 0.15, showGridLines: true, gridAccent: '' }, 'light')
  assert.match(out.gridLine, /var\(--dsw-alias-border-l1/)
})

test('gridPalette showGridLines=false 时 gridLine 透明', () => {
  const out = gridPalette({ iconAlpha: 0.08, gridLineAlpha: 0.15, showGridLines: false, gridAccent: '' }, 'light')
  assert.equal(out.gridLine, '1px solid transparent')
})

test('allEntries 只含内建 ⚙️', () => {
  const out = allEntries({})
  assert.equal(out.length, 1)
  assert.equal(out[0].id, SETTINGS_ENTRY_ID)
  assert.equal(out[0].builtin, true)
  assert.equal(BUILTIN_ENTRIES.length, 1)
})

test('readRegistry 过滤非法 icon 类型', () => {
  const fakeWin = {
    __dshIconRegistry: [
      { id: 'a', icon: '🅰️' },
      { id: 'b', icon: 42 },
      { id: 'c', icon: { react: 'element' } },
      { id: '', icon: '❌' },
      { icon: '❌' },
      null,
    ],
  }
  const out = readRegistry(fakeWin)
  assert.equal(out.length, 2)
  assert.equal(out[0].id, 'a')
  assert.equal(out[1].id, 'b')
})

test('readRegistry 丢弃非法 onClick / onUnload', () => {
  const fakeWin = {
    __dshIconRegistry: [
      { id: 'a', icon: '🅰️', onClick: () => {} },
      { id: 'b', icon: '🅱️', onClick: 'not-a-function' },
      { id: 'c', icon: '🇨', onUnload: 42 },
      { id: 'd', icon: '🇩', onUnload: () => {} },
    ],
  }
  const out = readRegistry(fakeWin)
  assert.deepEqual(out.map(e => e.id), ['a', 'd'])
})

test('allEntries 按 weight 降序排列，相同 weight 保持注册顺序', () => {
  const fakeWin = {
    __dshIconRegistry: [
      { id: 'a', icon: '1', weight: 1 },
      { id: 'b', icon: '2', weight: 5 },
      { id: 'c', icon: '3' },
      { id: 'd', icon: '4', weight: 5 },
    ],
  }
  const out = allEntries(fakeWin)
  assert.equal(out[0].id, SETTINGS_ENTRY_ID)
  assert.deepEqual(out.slice(1).map(e => e.id), ['b', 'd', 'a', 'c'])
})

test('allEntries 不修改原始注册表顺序', () => {
  const reg = [
    { id: 'a', icon: '1', weight: 1 },
    { id: 'b', icon: '2', weight: 5 },
  ]
  const fakeWin = { __dshIconRegistry: reg }
  allEntries(fakeWin)
  assert.equal(reg[0].id, 'a')
  assert.equal(reg[1].id, 'b')
})