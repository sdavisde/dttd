/**
 * Batches URL param changes that happen in the same synchronous call stack
 * into a single pushState/replaceState. This way, e.g. changing sort column +
 * sort direction + resetting page = one history entry, not three.
 */

type HistoryMethod = 'push' | 'replace'

let pending: Array<{
  key: string
  value: string | null
  method: HistoryMethod
}> = []
let scheduled = false

/**
 * Queue a URL param change. All calls within the same synchronous call stack
 * are collected and flushed as a single pushState/replaceState via microtask.
 * Pass null as value to remove the param.
 */
export function queueParamUpdate(
  key: string,
  value: string | null,
  method: HistoryMethod = 'push'
): void {
  pending.push({ key, value, method })
  if (!scheduled) {
    scheduled = true
    queueMicrotask(flush)
  }
}

/**
 * Apply all queued mutations to the URL in one shot. Uses replaceState if any
 * mutation in the batch requested 'replace' (e.g. search typing shouldn't
 * create history entries), otherwise pushState. Spreads existing history.state
 * to preserve Next.js internal routing state.
 */
function flush(): void {
  scheduled = false
  const mutations = pending
  pending = []
  if (mutations.length === 0) return

  // If any mutation in the batch uses 'replace', the whole batch does
  const useReplace = mutations.some((m) => m.method === 'replace')

  const params = new URLSearchParams(window.location.search)
  for (const { key, value } of mutations) {
    if (value === null) params.delete(key)
    else params.set(key, value)
  }

  const qs = params.toString()
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`
  // Spread history.state so we don't clobber Next.js internals
  const state = { ...window.history.state }

  if (useReplace) window.history.replaceState(state, '', url)
  else window.history.pushState(state, '', url)
}
