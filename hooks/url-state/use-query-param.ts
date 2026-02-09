'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Marshaller } from '@/lib/marshallers'
import { queueParamUpdate } from './url-batcher'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HistoryMethod = 'push' | 'replace'

export type QueryParamOptions<T> = Marshaller<T> & {
  /** 'push' creates a history entry, 'replace' overwrites the current one. Default: 'push'. */
  history?: HistoryMethod
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a single URL search param with React state as source of truth.
 * URL is kept in sync via the batcher (so multiple param changes in the
 * same event = one history entry).
 */
export function useQueryParam<T>(
  key: string,
  options: QueryParamOptions<T>
): [T, (value: T) => void] {
  const { unmarshal, history: method = 'push' } = options

  const searchParams = useSearchParams()
  const [value, setValue] = useState<T>(() => unmarshal(searchParams.get(key)))

  // Stable ref so the popstate listener and setter stay attached once,
  // even when callers pass inline marshal/unmarshal functions.
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search)
      setValue(optionsRef.current.unmarshal(params.get(key)))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [key])

  const set = useCallback(
    (next: T) => {
      setValue(next)
      queueParamUpdate(key, optionsRef.current.marshal(next), method)
    },
    [key, method]
  )

  return [value, set]
}
