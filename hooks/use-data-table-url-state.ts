'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type {
  SortingState,
  PaginationState,
  OnChangeFn,
  Updater,
} from '@tanstack/react-table'

interface UseDataTableUrlStateConfig {
  defaultSort?: SortingState
  defaultPageSize?: number
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
  const { defaultSort = [], defaultPageSize = 25 } = config

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

  const globalFilter = useMemo<string>(() => {
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

  const buildUrl = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams]
  )

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
      const newFilter = resolveUpdater(updaterOrValue, globalFilter)
      const url = buildUrl((params) => {
        if (newFilter) {
          params.set('search', newFilter)
        } else {
          params.delete('search')
        }
        // Reset pagination when search changes
        params.delete('page')
      })
      router.replace(url)
    },
    [globalFilter, buildUrl, router]
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
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
  }
}
