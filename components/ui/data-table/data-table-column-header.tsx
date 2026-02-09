'use client'

import { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DataTableColumnFilter } from './data-table-column-filter'
import '@/components/ui/data-table/types'
import { isNil } from 'lodash'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const hasFilter = !isNil(column.columnDef.meta?.filterType)

  if (!column.getCanSort() && !hasFilter) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {column.getCanSort() ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => {
            const currentSort = column.getIsSorted()
            if (currentSort === false) {
              column.toggleSorting(false)
            } else if (currentSort === 'asc') {
              column.toggleSorting(true)
            } else {
              column.clearSorting()
            }
          }}
        >
          {title}
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-1 size-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-1 size-4" />
          ) : (
            <ArrowUpDown className="ml-1 size-4" />
          )}
        </Button>
      ) : (
        <span>{title}</span>
      )}
      {hasFilter && <DataTableColumnFilter column={column} />}
    </div>
  )
}
