'use client'

import { Row, flexRender } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import '@/components/ui/data-table/types'

interface DataTableMobileCardProps<TData> {
  row: Row<TData>
  expandedRowId: string | null
  onToggle: (rowId: string) => void
}

export function DataTableMobileCard<TData>({
  row,
  expandedRowId,
  onToggle,
}: DataTableMobileCardProps<TData>) {
  const isExpanded = expandedRowId === row.id
  const visibleCells = row.getVisibleCells()

  const primaryCells = visibleCells.filter(
    (cell) => cell.column.columnDef.meta?.mobilePriority === 'primary'
  )
  const secondaryCells = visibleCells.filter(
    (cell) => cell.column.columnDef.meta?.mobilePriority === 'secondary'
  )
  const detailCells = visibleCells.filter(
    (cell) =>
      cell.column.columnDef.meta?.showOnMobile === true &&
      cell.column.columnDef.meta?.mobilePriority === 'detail'
  )

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggle(row.id)}
      className="bg-card rounded-lg border"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 p-4 text-left">
        <div className="min-w-0 flex-1">
          {/* Primary field (name) */}
          {primaryCells.map((cell) => (
            <div key={cell.id} className="text-base font-medium truncate">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
          {/* Secondary fields (church, payment) */}
          {secondaryCells.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {secondaryCells.map((cell) => (
                <span key={cell.id} className="text-muted-foreground">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            'text-muted-foreground size-5 shrink-0 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        {detailCells.length > 0 && (
          <div className="border-t px-4 pb-4 pt-3 space-y-2">
            {detailCells.map((cell) => {
              const label = cell.column.columnDef.meta?.mobileLabel
              return (
                <div
                  key={cell.id}
                  className="flex items-baseline gap-2 text-sm"
                >
                  {label && (
                    <span className="text-muted-foreground w-28 shrink-0">
                      {label}
                    </span>
                  )}
                  <span className="min-w-0 break-words">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
