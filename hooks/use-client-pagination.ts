import { useState, useMemo } from 'react'

export interface UseClientPaginationOptions {
  initialPage?: number
  initialPageSize?: number
}

export interface ClientPaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ClientPaginationActions {
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
}

export function useClientPagination<T>(
  data: T[],
  options: UseClientPaginationOptions = {}
) {
  const { initialPage = 1, initialPageSize = 10 } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const paginationState = useMemo((): ClientPaginationState => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const validCurrentPage = Math.min(
      Math.max(1, currentPage),
      Math.max(1, totalPages)
    )

    const startIndex = (validCurrentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)

    return {
      currentPage: validCurrentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: validCurrentPage < totalPages,
      hasPreviousPage: validCurrentPage > 1,
    }
  }, [data.length, currentPage, pageSize])

  const paginatedData = useMemo(() => {
    const start = paginationState.startIndex
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, paginationState.startIndex, pageSize])

  const actions: ClientPaginationActions = {
    setPage: (page: number) => {
      setCurrentPage(Math.min(Math.max(1, page), paginationState.totalPages))
    },
    setPageSize: (size: number) => {
      setPageSize(size)
      setCurrentPage(1)
    },
    nextPage: () => {
      if (paginationState.hasNextPage) {
        setCurrentPage(currentPage + 1)
      }
    },
    previousPage: () => {
      if (paginationState.hasPreviousPage) {
        setCurrentPage(currentPage - 1)
      }
    },
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(paginationState.totalPages),
  }

  return {
    paginatedData,
    pagination: paginationState,
    ...actions,
  }
}
