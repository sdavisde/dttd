'use client'

import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  Header,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { cn } from '@/lib/utils'
import { userHasPermission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { DataTableUrlState } from '@/hooks/use-data-table-url-state'
import {
  CollapsedGroupHeader,
  ExpandedGroupHeader,
} from './data-table-group-header'
import { DataTableMobileCard } from './data-table-mobile-card'
import { DataTableMobileToolbar } from './data-table-mobile-toolbar'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import '@/components/ui/data-table/types'
import { isEmpty, isNil } from 'lodash'

// Filter function for select-type columns (array includes)
const arrIncludesFilter: FilterFn<unknown> = (
  row: Row<unknown>,
  columnId: string,
  filterValue: string[]
) => {
  const value = String(row.getValue(columnId) ?? '')
  return filterValue.includes(value)
}

arrIncludesFilter.autoRemove = (val: unknown) => isNil(val) || isEmpty(val)

// ---------------------------------------------------------------------------
// Expandable column-group helpers
// ---------------------------------------------------------------------------

function getColumnId<TData, TValue>(
  col: ColumnDef<TData, TValue>
): string | undefined {
  return 'accessorKey' in col
    ? String(col.accessorKey)
    : 'id' in col
      ? col.id
      : undefined
}

function getChildColumns<TData, TValue>(
  col: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue>[] | undefined {
  return 'columns' in col
    ? (col.columns as ColumnDef<TData, TValue>[] | undefined)
    : undefined
}

/** Cell/header tint classes for children of an expanded group */
function expandedGroupCellClasses<TData, TValue>(
  column: Column<TData, TValue>,
  expandedGroupIds: string[]
): string | undefined {
  const parent = column.parent
  const groupMeta = parent?.columnDef.meta?.expandableGroup
  if (isNil(parent) || isNil(groupMeta)) return undefined
  if (!expandedGroupIds.includes(parent.id)) return undefined

  const visibleChildren = parent.columns.filter((c) => c.getIsVisible())
  const isFirst = visibleChildren[0]?.id === column.id
  const isLast = visibleChildren[visibleChildren.length - 1]?.id === column.id
  return cn(
    'bg-primary/5',
    isFirst && 'border-l-2 border-l-primary/20',
    isLast && 'border-r-2 border-r-primary/20'
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  user: User | null
  initialSort?: SortingState
  emptyState?: {
    noData: ReactNode
    noResults: ReactNode
  }
  globalFilterFn?: FilterFn<TData>
  urlState?: DataTableUrlState
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  columnVisibility?: VisibilityState
  toolbarChildren?: ReactNode
  /**
   * Opt-in visual overrides for the desktop table (design-system "board" look).
   * Consumers that omit this keep the existing default appearance.
   */
  appearance?: {
    /** Classes appended to the bordered table container. */
    container?: string
    /** Classes appended to every header cell. */
    header?: string
    /** Classes appended to every body cell. */
    cell?: string
    /** Zebra-stripe odd rows (defaults to true, the legacy look). */
    zebra?: boolean
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  user,
  initialSort,
  emptyState,
  globalFilterFn,
  urlState,
  searchPlaceholder,
  onRowClick,
  columnVisibility: columnVisibilityProp,
  toolbarChildren,
  appearance,
}: DataTableProps<TData, TValue>) {
  const zebra = appearance?.zebra ?? true
  // Internal state (used when urlState is not provided)
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    initialSort ?? []
  )
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  })

  // Use URL state if provided, otherwise internal state
  const sorting = urlState?.sorting ?? internalSorting
  const onSortingChange = urlState?.onSortingChange ?? setInternalSorting
  const columnFilters = urlState?.columnFilters ?? internalColumnFilters
  const onColumnFiltersChange =
    urlState?.onColumnFiltersChange ?? setInternalColumnFilters
  const globalFilter = urlState?.globalFilter ?? internalGlobalFilter
  const onGlobalFilterChange =
    urlState?.onGlobalFilterChange ?? setInternalGlobalFilter
  const pagination = urlState?.pagination ?? internalPagination
  const onPaginationChange =
    urlState?.onPaginationChange ?? setInternalPagination

  // Expandable column-group state (URL-synced when urlState is provided)
  const [internalExpandedGroups, setInternalExpandedGroups] = useState<
    string[]
  >([])
  const expandedGroups = urlState?.expandedGroups ?? internalExpandedGroups
  const setExpandedGroups =
    urlState?.onExpandedGroupsChange ?? setInternalExpandedGroups
  const toggleGroup = useCallback(
    (groupId: string) => {
      setExpandedGroups(
        expandedGroups.includes(groupId)
          ? expandedGroups.filter((id) => id !== groupId)
          : [...expandedGroups, groupId]
      )
    },
    [expandedGroups, setExpandedGroups]
  )

  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibility: VisibilityState = {}

    const applyRestrictions = (
      col: ColumnDef<TData, TValue>,
      hiddenByCollapse: boolean
    ) => {
      const colId = getColumnId(col)
      if (isNil(colId)) return

      const permission = col.meta?.requiredPermission
      const permissionVisible = isNil(permission)
        ? true
        : !isNil(user)
          ? userHasPermission(user, [permission])
          : false

      const propVisible = columnVisibilityProp?.[colId] ?? true

      // Only set visibility if any source restricts it
      if (!permissionVisible || !propVisible || hiddenByCollapse) {
        visibility[colId] = false
      } else if (!isNil(permission)) {
        // Preserve explicit true for permission-controlled columns
        visibility[colId] = true
      }
    }

    for (const col of columns) {
      const children = getChildColumns(col)
      const groupMeta = col.meta?.expandableGroup
      const groupId = getColumnId(col)

      if (isNil(children)) {
        applyRestrictions(col, false)
        continue
      }

      // Group column: restrictions apply per child. For collapsed expandable
      // groups, every child except the summary column is hidden.
      const collapsed =
        !isNil(groupMeta) &&
        !isNil(groupId) &&
        !expandedGroups.includes(groupId)
      for (const child of children) {
        const childId = getColumnId(child)
        const hiddenByCollapse =
          collapsed && childId !== groupMeta?.summaryColumnId
        applyRestrictions(child, hiddenByCollapse)
      }
    }
    return visibility
  }, [columns, user, columnVisibilityProp, expandedGroups])

  // Auto-assign arrIncludesFilter for select-type columns (including group children)
  const processedColumns = useMemo(() => {
    const process = (
      col: ColumnDef<TData, TValue>
    ): ColumnDef<TData, TValue> => {
      const children = getChildColumns(col)
      if (!isNil(children)) {
        return { ...col, columns: children.map(process) } as ColumnDef<
          TData,
          TValue
        >
      }
      if (col.meta?.filterType === 'select' && isNil(col.filterFn)) {
        return { ...col, filterFn: arrIncludesFilter } as ColumnDef<
          TData,
          TValue
        >
      }
      return col
    }
    return columns.map(process)
  }, [columns])

  const table = useReactTable({
    data,
    columns: processedColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(!isNil(globalFilterFn) ? { globalFilterFn } : {}),
  })

  // Mobile expanded card state (single-expand)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const handleCardToggle = useCallback((rowId: string) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId))
  }, [])

  const headerGroups = table.getHeaderGroups()
  // Column groups produce a two-row header tree (deeper nesting unsupported).
  const isNested = headerGroups.length > 1

  const renderNestedHeaderRows = () => {
    const topHeaders = headerGroups[0].headers
    const leafHeaders = headerGroups[headerGroups.length - 1].headers
    const leafHeaderById = new Map<string, Header<TData, unknown>>(
      leafHeaders.map((h) => [h.column.id, h])
    )

    // Leaf headers that belong in the second row: children of expanded
    // expandable groups and of plain (always-grouped) columns.
    const secondRowIds = new Set<string>()
    for (const header of topHeaders) {
      if (header.isPlaceholder) continue
      const column = header.column
      if (column.columns.length === 0) continue
      const groupMeta = column.columnDef.meta?.expandableGroup
      const collapsed = !isNil(groupMeta) && !expandedGroups.includes(column.id)
      if (collapsed) continue
      for (const child of column.columns) {
        if (child.getIsVisible()) secondRowIds.add(child.id)
      }
    }
    const hasSecondRow = secondRowIds.size > 0
    const rowSpan = hasSecondRow ? 2 : undefined

    return (
      <>
        <TableRow>
          {topHeaders.map((header) => {
            const column = header.column
            const groupMeta = column.columnDef.meta?.expandableGroup

            // Ungrouped column lifted into the top row (placeholder header)
            if (header.isPlaceholder) {
              const leaf = leafHeaderById.get(column.id)
              return (
                <TableHead
                  key={header.id}
                  rowSpan={rowSpan}
                  className="align-middle"
                >
                  {isNil(leaf)
                    ? null
                    : flexRender(
                        leaf.column.columnDef.header,
                        leaf.getContext()
                      )}
                </TableHead>
              )
            }

            if (!isNil(groupMeta)) {
              if (expandedGroups.includes(column.id)) {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="border-l-2 border-r-2 border-b border-l-primary/20 border-r-primary/20 border-b-primary/20 bg-primary/5"
                  >
                    <ExpandedGroupHeader
                      label={groupMeta.label}
                      onCollapse={() => toggleGroup(column.id)}
                    />
                  </TableHead>
                )
              }
              const summaryHeader = leafHeaderById.get(
                groupMeta.summaryColumnId
              )
              return (
                <TableHead
                  key={header.id}
                  rowSpan={rowSpan}
                  className="align-middle"
                >
                  {isNil(summaryHeader) ? null : (
                    <CollapsedGroupHeader
                      label={groupMeta.label}
                      summaryColumn={summaryHeader.column}
                      onExpand={() => toggleGroup(column.id)}
                    />
                  )}
                </TableHead>
              )
            }

            // Plain group column (always grouped, not expandable)
            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className="text-center"
              >
                {flexRender(column.columnDef.header, header.getContext())}
              </TableHead>
            )
          })}
        </TableRow>
        {hasSecondRow && (
          <TableRow>
            {leafHeaders
              .filter((h) => secondRowIds.has(h.column.id))
              .map((header) => (
                <TableHead
                  key={header.id}
                  className={expandedGroupCellClasses(
                    header.column,
                    expandedGroups
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
          </TableRow>
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Desktop layout ─────────────────────────────────── */}
      <div className="hidden md:block space-y-4">
        <DataTableToolbar table={table} placeholder={searchPlaceholder}>
          {toolbarChildren}
        </DataTableToolbar>

        <div className={cn('rounded-md border', appearance?.container)}>
          <Table>
            <TableHeader>
              {isNested
                ? renderNestedHeaderRows()
                : headerGroups.map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={appearance?.header}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
                    className="h-24 text-center"
                  >
                    {emptyState?.noData ?? 'No data.'}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
                    className="h-24 text-center"
                  >
                    {emptyState?.noResults ?? 'No results found.'}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      zebra && index % 2 === 1 ? 'bg-muted/25' : undefined,
                      !isNil(onRowClick) && 'cursor-pointer'
                    )}
                    onClick={
                      !isNil(onRowClick)
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          appearance?.cell,
                          expandedGroupCellClasses(cell.column, expandedGroups)
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* ── Mobile layout ──────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        <DataTableMobileToolbar table={table} placeholder={searchPlaceholder} />

        {data.length === 0 ? (
          <div className="py-8 text-center">
            {emptyState?.noData ?? 'No data.'}
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="py-8 text-center">
            {emptyState?.noResults ?? 'No results found.'}
          </div>
        ) : (
          <div className="space-y-2">
            {table.getRowModel().rows.map((row) => (
              <DataTableMobileCard
                key={row.id}
                row={row}
                expandedRowId={expandedRowId}
                onToggle={handleCardToggle}
                onCardClick={onRowClick}
              />
            ))}
          </div>
        )}

        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
