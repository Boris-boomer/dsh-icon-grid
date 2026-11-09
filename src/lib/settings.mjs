/**
 * settings describe() 解析（host / client / 单测共用）。
 *
 * DSH settings.describe() 有两种形态：
 *   - 数组：[{ ns, value, revision }, ...]
 *   - 对象：{ ok: true, value: { namespaces: [...] } }
 * host 和 client 必须走同一条解析，否则会出现"client 读得到、host 读不到"
 * 导致每次启动都写默认值、覆盖用户配置的问题。
 */

/**
 * @param {any} res describe() 返回值
 * @param {string} ns 命名空间
 * @returns {any | undefined}
 */
export function pickNamespace(res, ns) {
  if (Array.isArray(res)) return res.find(c => c?.ns === ns)
  if (res && res.ok && Array.isArray(res.value?.namespaces)) {
    return res.value.namespaces.find(c => c?.ns === ns)
  }
  return undefined
}

/**
 * 读取某个命名空间快照；失败返回 undefined。
 * @param {{ describe: () => Promise<any> }} settings
 * @param {string} ns
 */
export async function readNamespace(settings, ns) {
  try {
    return pickNamespace(await settings.describe(), ns)
  } catch {
    return undefined
  }
}