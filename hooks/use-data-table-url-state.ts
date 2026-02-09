'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { debounce } from 'lodash'
import type {
  SortingState,
  PaginationState,
  OnChangeFn,
  Updater,
} from '@tanstack/react-table'

interface UseDataTableUrlStateConfig {
  defaultSort?: SortingState
  defaultPageSize?: number
  /** Debounce delay in ms for search URL updates (default: 300) */
  searchDebounceMs?: number
}

export interface DataTableUrlState {
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

function resolveUpdater<T>(updaterOrValue: Updater<T>, prev: T): T {
  return typeof updaterOrValue === 'function'
    ? (updaterOrValue as (prev: T) => T)(prev)
    : updaterOrValue
}

export function useDataTableUrlState(
  config: UseDataTableUrlStateConfig = {}
): DataTableUrlState {
  const {
    defaultSort = [],
    defaultPageSize = 25,
    searchDebounceMs = 300,
  } = config

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse state from URL
  const sorting = useMemo<SortingState>(() => {
    const sort = searchParams.get('sort')
    const dir = searchParams.get('dir')
    if (sort) {
      return [{ id: sort, desc: dir === 'desc' }]
    }
    return defaultSort
  }, [searchParams, defaultSort])

  const urlGlobalFilter = useMemo<string>(() => {
    return searchParams.get('search') ?? ''
  }, [searchParams])

  const pagination = useMemo<PaginationState>(() => {
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')
    return {
      pageIndex: page ? Math.max(0, parseInt(page, 10) - 1) : 0,
      pageSize: pageSize ? parseInt(pageSize, 10) : defaultPageSize,
    }
  }, [searchParams, defaultPageSize])

  // Local state for immediate input responsiveness
  const [localGlobalFilter, setLocalGlobalFilter] = useState(urlGlobalFilter)

  // Sync local state when URL changes externally (e.g., back/forward navigation)
  useEffect(() => {
    setLocalGlobalFilter(urlGlobalFilter)
  }, [urlGlobalFilter])

  const buildUrl = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams]
  )

  // Debounced URL update for search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedReplaceUrl = useCallback(
    debounce((url: string) => {
      router.replace(url)
    }, searchDebounceMs),
    [router, searchDebounceMs]
  )

  // Clean up debounce on unmount
  const debouncedRef = useRef(debouncedReplaceUrl)
  debouncedRef.current = debouncedReplaceUrl
  useEffect(() => {
    return () => {
      debouncedRef.current.cancel()
    }
  }, [])

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSorting = resolveUpdater(updaterOrValue, sorting)
      const url = buildUrl((params) => {
        if (newSorting.length > 0) {
          params.set('sort', newSorting[0].id)
          params.set('dir', newSorting[0].desc ? 'desc' : 'asc')
        } else {
          params.delete('sort')
          params.delete('dir')
        }
        // Reset pagination when sort changes
        params.delete('page')
      })
      router.push(url)
    },
    [sorting, buildUrl, router]
  )

  const onGlobalFilterChange: OnChangeFn<string> = useCallback(
    (updaterOrValue) => {
      const newFilter = resolveUpdater(updaterOrValue, localGlobalFilter)
      // Update local state immediately for responsive input
      setLocalGlobalFilter(newFilter)
      // Debounce the URL update
      const url = buildUrl((params) => {
        if (newFilter) {
          params.set('search', newFilter)
        } else {
          params.delete('search')
        }
        // Reset pagination when search changes
        params.delete('page')
      })
      debouncedReplaceUrl(url)
    },
    [localGlobalFilter, buildUrl, debouncedReplaceUrl]
  )

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const newPagination = resolveUpdater(updaterOrValue, pagination)
      const url = buildUrl((params) => {
        if (newPagination.pageIndex > 0) {
          params.set('page', String(newPagination.pageIndex + 1))
        } else {
          params.delete('page')
        }
        if (newPagination.pageSize !== defaultPageSize) {
          params.set('pageSize', String(newPagination.pageSize))
        } else {
          params.delete('pageSize')
        }
      })
      router.push(url)
    },
    [pagination, buildUrl, router, defaultPageSize]
  )

  return {
    sorting,
    onSortingChange,
    globalFilter: localGlobalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
  }
}
