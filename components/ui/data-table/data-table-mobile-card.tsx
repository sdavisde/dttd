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
  onCardClick?: (row: TData) => void
}

export function DataTableMobileCard<TData>({
  row,
  expandedRowId,
  onToggle,
  onCardClick,
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
      <div className="flex w-full items-center gap-2 p-4 text-left">
        <div
          className={cn('min-w-0 flex-1', onCardClick && 'cursor-pointer')}
          onClick={onCardClick ? () => onCardClick(row.original) : undefined}
        >
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
        <CollapsibleTrigger asChild>
          <button className="p-1 shrink-0" type="button">
            <ChevronDown
              className={cn(
                'text-muted-foreground size-5 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
      </div>

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
