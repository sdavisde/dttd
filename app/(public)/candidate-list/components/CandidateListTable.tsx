'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HydratedCandidate } from '@/lib/candidates/types'
import { User } from '@/lib/users/types'
import { useCandidateList } from '../hooks/use-candidate-list'
import { CandidateColumnConfig } from '../config/columns'

/** Threshold for showing tooltip (characters) */
const TRUNCATE_THRESHOLD = 30

type CandidateListTableProps = {
  candidates: HydratedCandidate[]
  /** Current user for permission-based column filtering */
  user: User | null
}

export function CandidateListTable({
  candidates,
  user,
}: CandidateListTableProps) {
  const {
    // Column configuration
    desktopColumns,
    mobileColumns,
    // Data
    candidates: paginatedCandidates,
    totalFiltered,
    totalCandidates,
    // Search
    searchQuery,
    setSearchQuery,
    clearSearch,
    // Sort
    sortColumn,
    sortDirection,
    handleSort,
    // Pagination
    pagination,
    setPage,
    setPageSize,
    // Utilities
    getCellValue,
  } = useCandidateList(candidates, { user })

  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return null
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    )
  }

  const renderCellContent = (
    candidate: HydratedCandidate,
    column: CandidateColumnConfig
  ) => {
    const value = getCellValue(candidate, column)

    if (!value) return '-'

    // Show tooltip for long values
    if (value.length > TRUNCATE_THRESHOLD) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block max-w-[200px] truncate cursor-help">
              {value}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[300px] whitespace-pre-wrap"
          >
            {value}
          </TooltipContent>
        </Tooltip>
      )
    }

    return value
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone, sponsor, or church..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {searchQuery.trim() && (
        <div className="text-sm text-muted-foreground">
          Showing {totalFiltered} of {totalCandidates} candidates
        </div>
      )}

      {/* Desktop Table - Hidden on mobile */}
      <div className="relative hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {desktopColumns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 select-none',
                      column.minWidth && `min-w-[${column.minWidth}]`
                    )}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.header}
                    {renderSortIcon(column.id)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={desktopColumns.length}
                    className="text-center py-8"
                  >
                    <p className="text-muted-foreground">
                      {totalCandidates === 0
                        ? 'No candidates for this weekend.'
                        : searchQuery.trim()
                          ? 'No candidates found matching your search.'
                          : 'No candidates to display.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCandidates.map((candidate, index) => (
                  <TableRow
                    key={candidate.id}
                    className={cn(
                      'hover:bg-muted/50',
                      index % 2 === 1 && 'bg-muted/25'
                    )}
                  >
                    {desktopColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.id === 'name' && 'font-medium',
                          column.id !== 'name' && 'text-muted-foreground'
                        )}
                      >
                        {renderCellContent(candidate, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Mobile Card Layout - Shown only on mobile */}
      <div className="md:hidden space-y-3">
        {paginatedCandidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {totalCandidates === 0
                ? 'No candidates for this weekend.'
                : searchQuery.trim()
                  ? 'No candidates found matching your search.'
                  : 'No candidates to display.'}
            </p>
          </div>
        ) : (
          paginatedCandidates.map((candidate) => (
            <CandidateMobileCard
              key={candidate.id}
              candidate={candidate}
              columns={mobileColumns}
              getCellValue={getCellValue}
            />
          ))
        )}

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
    </div>
  )
}

type CandidateMobileCardProps = {
  candidate: HydratedCandidate
  columns: CandidateColumnConfig[]
  getCellValue: (
    candidate: HydratedCandidate,
    column: CandidateColumnConfig
  ) => string | null
}

function CandidateMobileCard({
  candidate,
  columns,
  getCellValue,
}: CandidateMobileCardProps) {
  // Get the name column for the header
  const nameColumn = columns.find((col) => col.id === 'name')
  const name = nameColumn ? getCellValue(candidate, nameColumn) : 'Unknown'

  // Other columns (excluding name which is shown in header)
  const detailColumns = columns.filter((col) => col.id !== 'name')

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      {/* Header with name */}
      <div className="font-medium text-lg">{name}</div>

      {/* Detail fields */}
      <div className="space-y-2 text-sm">
        {detailColumns.map((column) => {
          const value = getCellValue(candidate, column)

          return (
            <div key={column.id} className="flex">
              <span className="text-muted-foreground w-28 shrink-0">
                {column.mobileLabel ?? column.header}:
              </span>
              <span className="text-foreground break-all">{value ?? '--'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
