'use client'

import { ReactNode, useMemo, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { DataTableUrlState } from '@/hooks/use-data-table-url-state'
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
}: DataTableProps<TData, TValue>) {
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

  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibility: VisibilityState = {}
    for (const col of columns) {
      const permission = col.meta?.requiredPermission
      const colId =
        'accessorKey' in col
          ? String(col.accessorKey)
          : 'id' in col
            ? col.id
            : undefined
      if (isNil(colId) || isNil(permission)) continue

      if (!isNil(user)) {
        visibility[colId] = userHasPermission(user, [permission])
      } else {
        visibility[colId] = false
      }
    }
    return visibility
  }, [columns, user])

  // Auto-assign arrIncludesFilter for select-type columns
  const processedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.meta?.filterType === 'select' && isNil(col.filterFn)) {
        return { ...col, filterFn: arrIncludesFilter } as ColumnDef<
          TData,
          TValue
        >
      }
      return col
    })
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
    ...(globalFilterFn ? { globalFilterFn } : {}),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} placeholder={searchPlaceholder} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState?.noData ?? 'No data.'}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState?.noResults ?? 'No results found.'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={index % 2 === 1 ? 'bg-muted/25' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
  )
}
