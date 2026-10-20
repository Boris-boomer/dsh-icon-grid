# DSH-ICON-GRID

> DSH（DeepSeek Host）插件：通用图标网格容器，把插件入口收进可拖拽排序的浮动网格。

外部插件通过 `window.__dshIconRegistry` 推入图标，本插件只负责「注册表 → 槽位」的排列、持久化、拖拽排序和设置面板。不依赖任何皮肤 / 主题插件，配色全部交给 DSH 当前的 CSS 变量。

## 与其它 DSH 插件的关系

- **dsh-plugin-namecards**：管理 DSH **官方插件页**的展示（图标、中文名、文件夹分组、拖拽排序、铺陈视图）。本插件管理的是**任意插件通过 `window.__dshIconRegistry` 推入的自定义入口**，两者职责不重叠。
- **dsh-sidebar-icon-row** / **dsh-agent-grid**：调整**侧栏**布局（行内图标、智能体看板）。本插件是**独立浮动网格**，不碰侧栏。
- **dsh-quick-toolbar**：把散落的按钮聚合到标题栏 / 悬浮球，适配器驱动。本插件聚合的是**图标入口**，并用网格排列。
- **dsh-bot-mode**：它有一个 Bot 列表的图标网格，但写死在 Bot 场景。本插件是**通用容器**。

## 功能

- 浮动在输入框右侧（空间不足时自动贴屏幕右边）的可拖拽图标网格。
- 拖拽交换格子；越界自动保护 `+N` 溢出格。
- 右键非内建图标 → 打开 / 卸载插件。
- 内建一个 ⚙️ 图标，点击打开设置面板。
- 无外部图标时，第一个空槽显示半透明 `＋` 提示。
- 设置面板：列数、行数、格子大小、间距、图标底色、边距、网格线开关与深浅、图标主色。
- 配置持久化：localStorage 兜底 + DSH settings 主存，host 广播实时同步。
- 首次启动自动从旧的 `dsh-ui` 命名空间迁移 `iconGrid` 配置。
- 外部图标支持 `weight` 字段决定默认排序。

## 兼容性

- Node.js ≥ 18（推荐 20）
- DSH 宿主 ≥ `0.2.0-rc.1`（声明在 `engines.dsh`，未做严格校验）
- 依赖 `[class*="BynINW_centerCol"]`、`[data-composer-card]` 两个 DSH DOM 标记做布局对齐；DSH 改版若改动这两个选择器，网格会回落到「贴屏幕右边」方案（代码里有兜底）。

## 安装

```bash
git clone <repo> dsh-icon-grid
cd dsh-icon-grid
pnpm install
pnpm check      # typecheck + lint + test
pnpm build      # tsdown → lib/client.js
```

挂载到 DSH 宿主（具体路径取决于 DSH 版本，见宿主文档）。

## 使用

### 命令行

- `dsh-icon-grid` — 查看当前网格状态
- `dsh-icon-grid grid <cols> <rows>` — 设置网格行列（列 3-16、行 2-24）

### 面板

右下角 ⚙️ 图标 → 打开图标网格设置面板。

## 外部插件接入

插件通过全局注册表向网格推入图标：

```js
window.__dshIconRegistry ??= []
window.__dshIconRegistry.push({
  id: 'my-plugin',
  icon: '🚀',              // string 或 number，必填
  label: '我的插件',
  weight: 0,               // 可选，越大越靠前；相同 weight 保持注册顺序
  onClick: () => { /* 打开插件 */ },      // 可选，必须是函数
  onUnload: () => { /* 卸载回调 */ },     // 可选，必须是函数
})
```

`readRegistry()` 会过滤掉以下条目，避免把 Grid 渲染崩掉：

- `id` 不是非空字符串
- `icon` 不是 `string` / `number`（不允许 React 元素、对象）
- `onClick` / `onUnload` 存在但不是函数

内建 ⚙️ 永远排在最前；外部图标按 `weight` 降序排列。

## 配置

单一命名空间 `dsh-icon-grid`：

```js
{
  iconGrid: {
    order: [],            // 图标 id 排列（'' 为空槽）
    cols: 8, rows: 12,
    cell: 46, gap: 6,
    iconAlpha: 0.08,
    gridAccent: '',       // ''=跟随明暗半透明；'#rrggbb'=主色着色
    marginRight: 24, marginBottom: 24,
    showGridLines: true,
    gridLineAlpha: 0.15,
  },
}
```

## 主题色

网格配色不读取任何皮肤 token 表，全部交给浏览器解析 DSH 当前主题的 CSS 变量：

- 图标颜色：`var(--dsw-alias-label-primary, ...)`
- 网格线：`var(--dsw-alias-border-l1, ...)`
- 图标底色：`iconAlpha` 半透明黑 / 白；或设置 `gridAccent` 后用
  `color-mix(in srgb, <accent> N%, transparent)` 着色。

## 调试

- `window.__dshIconRegistry` 可直接观察当前注册表。

## 开发

```bash
pnpm check        # typecheck + lint + test
pnpm build        # tsdown → lib/client.js
pnpm test:unit    # Node 环境纯函数测试
pnpm test:dom     # tsx 环境 DOM 相关测试
```

红线（详见 `eslint.config.js` 与 `tsdown.config.ts`）：

1. `.mjs` 文件禁止任何 TypeScript 语法。
2. 不要引入皮肤 / 图片资产相关的依赖；网格是纯 UI 层。
3. 改 `tsdown.config.ts` 的 `banner` id、`cordis.patch.yml` 的 id、
   `package.json` 的 `dsh.client.inject` 三者必须保持一致。

## 发布

- GitHub：直接提交仓库根目录即可（`.gitignore` 已忽略 `node_modules` / `lib`）。
- npm：`package.json` 目前带 `"private": true`，发布前删掉该字段，再 `pnpm build && npm publish`。
  `files` 字段已包含运行时必需的 `src/`、`lib/client.js`、`cordis.patch.yml`。

## 当前未实现

- **长列表**：图标数量远超可见槽位时，只能通过「+N」入口去设置里调大行列，没有虚拟滚动 / 分页。
- **移动端**：Pointer Events 拖拽理论可用，但长按拖拽、右键卸载菜单在移动端 DSH Web 视图里未验证。
- **多端同步**：本地 localStorage 优先于 DSH settings。如果同一账号在多台设备改了网格，
  本地会一直覆盖远端，直到清掉 localStorage。原 `dsh-ui` 也是这个行为，暂未改。
- **DSH DOM 契约**：`[class*="BynINW_centerCol"]` 是 DSH 当前构建的 hash 选择器，
  DSH 改版后需要同步；代码里对找不到该元素有「贴屏幕右边」兜底。

## 许可

MIT License