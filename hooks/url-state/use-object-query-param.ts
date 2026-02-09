'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { queueParamUpdate } from './url-batcher'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HistoryMethod = 'push' | 'replace'

/** Values are either a plain string or an array (from comma-split). */
export type ParamRecord = Record<string, string | string[]>

export interface ObjectQueryParamOptions {
  /** Prefix for URL params, e.g. 'filter.' → reads filter.payment, filter.church, etc. */
  prefix: string
  /** Default: 'push'. */
  history?: HistoryMethod
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFromUrl(params: URLSearchParams, prefix: string): ParamRecord {
  const record: ParamRecord = {}
  params.forEach((value, key) => {
    if (key.startsWith(prefix)) {
      const field = key.slice(prefix.length)
      const parts = value.split(',')
      record[field] = parts.length > 1 ? parts : value
    }
  })
  return record
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a group of prefixed URL params (e.g. filter.payment, filter.church)
 * as a single Record. URL is kept in sync via the batcher.
 */
export function useObjectQueryParam(
  options: ObjectQueryParamOptions
): [ParamRecord, (next: ParamRecord) => void] {
  const { prefix, history: method = 'push' } = options

  const searchParams = useSearchParams()
  const [record, setRecord] = useState<ParamRecord>(() =>
    parseFromUrl(searchParams, prefix)
  )

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search)
      setRecord(parseFromUrl(params, prefix))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [prefix])

  // Recreated each render so `record` in the closure is always current.
  const set = (next: ParamRecord) => {
    // Delete keys that were in the old record but not in the new one
    for (const field of Object.keys(record)) {
      if (!(field in next)) {
        queueParamUpdate(`${prefix}${field}`, null, method)
      }
    }
    // Set all keys in the new record
    for (const [field, value] of Object.entries(next)) {
      const serialized = Array.isArray(value) ? value.join(',') : value
      queueParamUpdate(`${prefix}${field}`, serialized ?? null, method)
    }
    setRecord(next)
  }

  return [record, set]
}
