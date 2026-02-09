'use client'

import type {
  ColumnFiltersState,
  SortingState,
  PaginationState,
  OnChangeFn,
  Updater,
} from '@tanstack/react-table'
import {
  stringMarshaller,
  intMarshaller,
  booleanMarshaller,
  pageMarshaller,
} from '@/lib/marshallers'
import {
  useQueryParam,
  useObjectQueryParam,
  recordToFilters,
  filtersToRecord,
} from './url-state'

// ---------------------------------------------------------------------------
// Public types (unchanged from before)
// ---------------------------------------------------------------------------

interface UseDataTableUrlStateConfig {
  defaultSort?: SortingState
  defaultPageSize?: number
}

export interface DataTableUrlState {
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveUpdater<T>(updaterOrValue: Updater<T>, prev: T): T {
  return typeof updaterOrValue === 'function'
    ? (updaterOrValue as (prev: T) => T)(prev)
    : updaterOrValue
}

// ---------------------------------------------------------------------------
// Hook — composes primitive URL hooks into TanStack Table's state API
// ---------------------------------------------------------------------------

export function useDataTableUrlState(
  config: UseDataTableUrlStateConfig = {}
): DataTableUrlState {
  const { defaultSort = [], defaultPageSize = 25 } = config
  const defaultSortId = defaultSort[0]?.id ?? ''
  const defaultSortDesc = defaultSort[0]?.desc ?? false

  // --- Primitive URL params ---

  const [sortColumn, setSortColumn] = useQueryParam('sort', {
    ...stringMarshaller(defaultSortId),
  })

  const [sortDesc, setSortDesc] = useQueryParam('dir', {
    ...booleanMarshaller({
      trueValue: 'desc',
      falseValue: 'asc',
      defaultValue: defaultSortDesc,
    }),
  })

  const [search, setSearch] = useQueryParam('search', {
    ...stringMarshaller(),
    history: 'replace',
  })

  const [pageIndex, setPageIndex] = useQueryParam('page', pageMarshaller())

  const [pageSize, setPageSize] = useQueryParam(
    'pageSize',
    intMarshaller(defaultPageSize)
  )

  const [filterRecord, setFilterRecord] = useObjectQueryParam({
    prefix: 'filter.',
  })

  // --- Derived TanStack Table state ---

  const sorting: SortingState = sortColumn
    ? [{ id: sortColumn, desc: sortDesc }]
    : defaultSort

  const pagination: PaginationState = { pageIndex, pageSize }

  const columnFilters: ColumnFiltersState = recordToFilters(filterRecord)

  // --- TanStack onChange handlers ---
  // No useCallback — handlers always have fresh closure values, so no refs
  // needed. TanStack Table doesn't require referential stability.

  const onSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const next = resolveUpdater(updaterOrValue, sorting)
    if (next.length > 0) {
      setSortColumn(next[0].id)
      setSortDesc(next[0].desc)
    } else {
      setSortColumn('')
      setSortDesc(false)
    }
    setPageIndex(0) // batched into the same history entry
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    const next = resolveUpdater(updaterOrValue, search)
    setSearch(next)
    setPageIndex(0)
  }

  const onPaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next = resolveUpdater(updaterOrValue, pagination)
    setPageIndex(next.pageIndex)
    setPageSize(next.pageSize)
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    const next = resolveUpdater(updaterOrValue, columnFilters)
    setFilterRecord(filtersToRecord(next))
    setPageIndex(0)
  }

  return {
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter: search,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
  }
}
