/**
 * Dev-only Supabase call logger. Active only when `AUDIT_LOG` names a file:
 * every request supabase-js makes through the wrapped `fetch` is appended to
 * it as one JSON line, after an optional artificial delay
 * (`AUDIT_SIM_LATENCY_MS`) that approximates a production round-trip.
 * Without `AUDIT_LOG` every helper here returns `undefined` and the clients
 * behave exactly as before.
 */
// Resolved at call time through `process.getBuiltinModule` so no bundle
// (browser, proxy) ever has to resolve `node:fs` statically.
function appendLine(target: string, line: string) {
  const fs = process.getBuiltinModule('node:fs')
  fs.appendFileSync(target, line)
}

export type AuditClient = 'user' | 'admin' | 'middleware'

/** Header the proxy stamps on each request so calls can be tied to a page. */
export const AUDIT_REQ_HEADER = 'x-audit-req'
export const AUDIT_ROUTE_HEADER = 'x-audit-route'

export function isAuditEnabled(): boolean {
  const target = process.env.AUDIT_LOG
  return typeof target === 'string' && target !== ''
}

type Kind = 'auth' | 'rest' | 'storage' | 'other'

function classify(pathname: string): { kind: Kind; table: string } {
  const match = /^\/(auth|rest|storage)\/v1\/([^/?]+)/.exec(pathname)
  if (match === null) return { kind: 'other', table: pathname }
  const [, api, name] = match
  return { kind: api as Kind, table: name }
}

let sequence = 0

/**
 * Request-scoped identifiers, resolved by the caller. `mode` is how the
 * request reached the render: `action` (server action POST), `document`
 * (any render: HTML, RSC navigation or prefetch — Next hides the `rsc` and
 * `next-router-prefetch` flight headers from `headers()`, so those cannot be
 * told apart here) or `proxy` (the middleware's own call).
 */
export type AuditScope = { reqId?: string; route?: string; mode?: string }

/** Classifies a render request from the headers Next exposes to it. */
export function auditModeFromHeaders(get: (name: string) => string | null) {
  if (get('next-action') !== null) return 'action'
  if (get('next-router-prefetch') === '1') return 'prefetch'
  if (get('rsc') === '1') return 'rsc'
  return 'document'
}

/**
 * Builds a `fetch` for supabase-js `global.fetch`. `scope` may be async so
 * server clients can read `headers()` lazily at call time.
 */
export function createAuditFetch(
  client: AuditClient,
  scope: () => Promise<AuditScope> | AuditScope = () => ({})
): typeof fetch | undefined {
  if (!isAuditEnabled()) return undefined
  const target = process.env.AUDIT_LOG as string
  const parsed = Number(process.env.AUDIT_SIM_LATENCY_MS ?? 0)
  const simMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 0

  return async (input, init) => {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    )
    const method =
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    const ts = Date.now()
    const start = process.hrtime.bigint()
    const seq = ++sequence
    let status = 0
    let scopeInfo: AuditScope = {}
    try {
      scopeInfo = await scope()
    } catch {
      // outside a request scope (e.g. background work); leave blank
    }
    try {
      if (simMs > 0) await new Promise((resolve) => setTimeout(resolve, simMs))
      const response = await fetch(input, init)
      status = response.status
      return response
    } finally {
      const durMs = Number(process.hrtime.bigint() - start) / 1e6
      const { kind, table } = classify(url.pathname)
      const line = {
        ts,
        durMs: Math.round(durMs * 100) / 100,
        simMs,
        client,
        method,
        kind,
        table,
        query: url.search.slice(0, 200),
        status,
        reqId: scopeInfo.reqId ?? null,
        route: scopeInfo.route ?? null,
        mode: scopeInfo.mode ?? null,
        seq,
      }
      try {
        appendLine(target, JSON.stringify(line) + '\n')
      } catch {
        // never let audit logging break a request
      }
    }
  }
}
