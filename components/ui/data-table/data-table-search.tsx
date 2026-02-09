'use client'

import { Table } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface DataTableSearchProps<TData> {
  table: Table<TData>
  placeholder?: string
}

export function DataTableSearch<TData>({
  table,
  placeholder = 'Search...',
}: DataTableSearchProps<TData>) {
  const globalFilter = (table.getState().globalFilter as string) ?? ''

  return (
    <div className="relative w-full">
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={globalFilter}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className="pl-10 pr-10"
      />
      {globalFilter && (
        <button
          type="button"
          onClick={() => table.setGlobalFilter('')}
          className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="size-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  )
}
