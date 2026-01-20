'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HydratedCandidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Users, Info, MoreHorizontal } from 'lucide-react'
import { isEmpty } from 'lodash'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusLegend } from './StatusLegend'
import { useRouter } from 'next/navigation'

type SortColumn = 'name' | 'sponsor' | 'submitted' | 'status' | null

interface CandidateTableProps {
  candidates: HydratedCandidate[]
  sortColumn?: SortColumn
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: SortColumn) => void
  showArchived?: boolean
  onSendForms?: (candidate: HydratedCandidate) => void
  onSendPaymentRequest?: (candidate: HydratedCandidate) => void
  onReject?: (candidate: HydratedCandidate) => void
}

export function CandidateTable({
  candidates,
  sortColumn = null,
  sortDirection = 'asc',
  onSort,
  showArchived = false,
  onSendForms,
  onSendPaymentRequest,
  onReject,
}: CandidateTableProps) {
  const router = useRouter()

  const handleRowClick = (candidate: HydratedCandidate) => {
    router.push(`/review-candidates/${candidate.id}`)
  }
  if (isEmpty(candidates)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed bg-muted/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No candidates found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          We couldn&apos;t find any candidates matching your criteria.
        </p>
      </div>
    )
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    )
  }

  const handleHeaderClick = (column: SortColumn) => {
    if (onSort) {
      onSort(column)
    }
  }
  return (
    <>
      {/* Desktop Table - Hidden on mobile */}
      <div className="relative hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleHeaderClick('name')}
              >
                Candidate Name{renderSortIcon('name')}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleHeaderClick('sponsor')}
              >
                Sponsor{renderSortIcon('sponsor')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleHeaderClick('submitted')}
              >
                Submitted{renderSortIcon('submitted')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50 flex items-center"
                onClick={() => handleHeaderClick('status')}
              >
                <span>Status</span>

                <Popover>
                  <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Status Reference</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">
                        Status Reference
                      </h4>
                      <StatusLegend />
                    </div>
                  </PopoverContent>
                </Popover>

                {renderSortIcon('status')}
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate, index) => (
              <TableRow
                key={candidate.id}
                onClick={() => handleRowClick(candidate)}
                className={cn(
                  index % 2 === 0 ? 'bg-transparent' : 'bg-muted',
                  'hover:bg-muted/50 cursor-pointer',
                  candidate.status === 'rejected' &&
                    showArchived &&
                    'opacity-50 bg-muted/30'
                )}
              >
                <TableCell>
                  {candidate.candidate_sponsorship_info?.candidate_name}
                </TableCell>
                <TableCell>
                  {candidate.candidate_sponsorship_info?.candidate_email}
                </TableCell>
                <TableCell>
                  {candidate.candidate_sponsorship_info?.sponsor_name}
                </TableCell>
                {/*<TableCell>
                  {candidate.weekends?.type === 'MENS' ? "Men's" : candidate.weekends?.type === 'WOMENS' ? "Women's" : 'Unassigned'}
                </TableCell>*/}
                <TableCell>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusChip status={candidate.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRowClick(candidate)}
                        className="cursor-pointer"
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onSendForms?.(candidate)}
                        className="cursor-pointer"
                      >
                        Send Forms
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onSendPaymentRequest?.(candidate)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        Request Payment
                        {candidate.candidate_sponsorship_info?.payment_owner ===
                          'sponsor' && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (sponsor)
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => onReject?.(candidate)}
                      >
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout - Shown only on mobile */}
      <div className="md:hidden space-y-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(candidate)}
          >
            {/* Header with name and status */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {candidate.candidate_sponsorship_info?.candidate_name ??
                  'Unknown Candidate'}
              </h3>
              <StatusChip status={candidate.status} />
            </div>

            {/* Content sections */}
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-muted-foreground w-16">Email:</span>
                <span>
                  {candidate.candidate_sponsorship_info?.candidate_email ??
                    'Not provided'}
                </span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-16">Sponsor:</span>
                <span>
                  {candidate.candidate_sponsorship_info?.sponsor_name ??
                    'Unknown'}
                </span>
              </div>
              {/*<div className="flex">
                  <span className="text-muted-foreground w-16">Weekend:</span>
                  <span>
                    {candidate.weekends?.type === 'MENS'
                      ? "Men's Weekend"
                      : candidate.weekends?.type === 'WOMENS'
                        ? "Women's Weekend"
                        : 'Unassigned'}
                  </span>
                </div>*/}
              <div className="flex">
                <span className="text-muted-foreground w-16">Submitted:</span>
                <span>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
