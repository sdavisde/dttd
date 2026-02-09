'use client'

import { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-3', className)}
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
  )
}
