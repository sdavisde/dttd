import { useEffect, useState } from 'react'
import { Result, isErr } from '@/lib/results'

export type ServerPaginationSortDirection = 'asc' | 'desc'

export interface ServerPageData<T, SortField extends string> {
  page: number
  pageSize: number
  sortField: SortField
  sortDirection: ServerPaginationSortDirection
  currentPageItems: T[]
  nextPageItems: T[]
}

export interface ServerPaginationFetchParams<SortField extends string> {
  page: number
  pageSize: number
  sortField: SortField
  sortDirection: ServerPaginationSortDirection
}

export interface UseServerPaginationOptions<T, SortField extends string> {
  initialPageData: ServerPageData<T, SortField>
  fetchPage: (
    params: ServerPaginationFetchParams<SortField>
  ) => Promise<Result<string, ServerPageData<T, SortField>>>
}

export interface ServerPaginationState<T, SortField extends string> {
  currentPage: number
  pageSize: number
  sortField: SortField
  sortDirection: ServerPaginationSortDirection
  currentPageItems: T[]
  isPageLoading: boolean
  error: string | null
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ServerPaginationActions<T, SortField extends string> {
  nextPage: () => Promise<void>
  previousPage: () => void
  toggleSort: (field: SortField) => Promise<void>
  removeItemFromCache: (predicate: (item: T) => boolean) => void
}

export function useServerPagination<T, SortField extends string>({
  initialPageData,
  fetchPage,
}: UseServerPaginationOptions<T, SortField>) {
  const [sortField, setSortField] = useState<SortField>(
    initialPageData.sortField
  )
  const [sortDirection, setSortDirection] =
    useState<ServerPaginationSortDirection>(initialPageData.sortDirection)
  const [currentPage, setCurrentPage] = useState(initialPageData.page)
  const [pageSize] = useState(initialPageData.pageSize)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageCache, setPageCache] = useState<Record<number, T[]>>({
    [initialPageData.page]: initialPageData.currentPageItems,
    [initialPageData.page + 1]: initialPageData.nextPageItems,
  })
  const [lastPage, setLastPage] = useState<number | null>(
    initialPageData.nextPageItems.length === 0 ? initialPageData.page : null
  )

  useEffect(() => {
    setSortField(initialPageData.sortField)
    setSortDirection(initialPageData.sortDirection)
    setCurrentPage(initialPageData.page)
    setPageCache({
      [initialPageData.page]: initialPageData.currentPageItems,
      [initialPageData.page + 1]: initialPageData.nextPageItems,
    })
    setLastPage(
      initialPageData.nextPageItems.length === 0 ? initialPageData.page : null
    )
    setError(null)
  }, [initialPageData])

  const applyBundle = (
    bundle: ServerPageData<T, SortField>,
    reset: boolean = false
  ) => {
    if (reset) {
      setPageCache({
        [bundle.page]: bundle.currentPageItems,
        [bundle.page + 1]: bundle.nextPageItems,
      })
      setLastPage(bundle.nextPageItems.length === 0 ? bundle.page : null)
      return
    }

    setPageCache((prev) => ({
      ...prev,
      [bundle.page]: bundle.currentPageItems,
      [bundle.page + 1]: bundle.nextPageItems,
    }))

    if (bundle.nextPageItems.length === 0) {
      setLastPage((prev) =>
        prev === null ? bundle.page : Math.min(prev, bundle.page)
      )
    }
  }

  const fetchPageBundle = async (
    page: number,
    nextSortField: SortField = sortField,
    nextSortDirection: ServerPaginationSortDirection = sortDirection
  ) => {
    const result = await fetchPage({
      page,
      pageSize,
      sortField: nextSortField,
      sortDirection: nextSortDirection,
    })

    if (isErr(result)) {
      setError(result.error)
      return null
    }

    setError(null)
    return result.data
  }

  const toggleSort = async (field: SortField) => {
    const nextSortField = field
    const nextSortDirection: ServerPaginationSortDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'

    setIsPageLoading(true)

    try {
      const bundle = await fetchPageBundle(1, nextSortField, nextSortDirection)

      if (!bundle) return

      setSortField(nextSortField)
      setSortDirection(nextSortDirection)
      setCurrentPage(1)
      applyBundle(bundle, true)
    } finally {
      setIsPageLoading(false)
    }
  }

  const nextPage = async () => {
    if (isPageLoading) return

    const targetPage = currentPage + 1
    setIsPageLoading(true)

    try {
      let targetItems = pageCache[targetPage]
      let targetBundle: ServerPageData<T, SortField> | null = null

      if (typeof targetItems === 'undefined') {
        targetBundle = await fetchPageBundle(targetPage)
        if (!targetBundle) return

        applyBundle(targetBundle)
        targetItems = targetBundle.currentPageItems
      }

      if (!targetItems || targetItems.length === 0) {
        setLastPage((prev) =>
          prev === null ? targetPage - 1 : Math.min(prev, targetPage - 1)
        )
        return
      }

      setCurrentPage(targetPage)

      const hasFollowingPageCached =
        typeof pageCache[targetPage + 1] !== 'undefined'
      const canHaveFollowingPage = lastPage === null || targetPage < lastPage

      if (!hasFollowingPageCached && canHaveFollowingPage && !targetBundle) {
        const prefetchBundle = await fetchPageBundle(targetPage)
        if (prefetchBundle) {
          applyBundle(prefetchBundle)
        }
      }
    } finally {
      setIsPageLoading(false)
    }
  }

  const previousPage = () => {
    if (isPageLoading || currentPage === 1) return
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  const removeItemFromCache = (predicate: (item: T) => boolean) => {
    setPageCache((prev) => {
      const next: Record<number, T[]> = {}
      for (const [page, items] of Object.entries(prev)) {
        next[Number(page)] = items.filter((item) => !predicate(item))
      }
      return next
    })
  }

  const currentPageItems = pageCache[currentPage] ?? []
  const hasPreviousPage = currentPage > 1
  const hasKnownNextPage = (pageCache[currentPage + 1] ?? []).length > 0
  const hasNextPage =
    lastPage !== null
      ? currentPage < lastPage
      : hasKnownNextPage || !isPageLoading

  const state: ServerPaginationState<T, SortField> = {
    currentPage,
    pageSize,
    sortField,
    sortDirection,
    currentPageItems,
    isPageLoading,
    error,
    hasPreviousPage,
    hasNextPage,
  }

  const actions: ServerPaginationActions<T, SortField> = {
    nextPage,
    previousPage,
    toggleSort,
    removeItemFromCache,
  }

  return {
    ...state,
    ...actions,
  }
}
