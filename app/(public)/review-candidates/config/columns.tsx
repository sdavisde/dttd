'use client'

import { ColumnDef, FilterFn, Row, SortingFn } from '@tanstack/react-table'
import { HydratedCandidate, CandidateStatus } from '@/lib/candidates/types'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { StatusChip } from '@/components/candidates/status-chip'
import { StatusLegend } from '../components/StatusLegend'
import { CandidatePaymentInfo } from '../components/CandidatePaymentInfo'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { Info, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Status ordering (action-priority)
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<CandidateStatus, number> = {
  sponsored: 0,
  pending_approval: 1,
  awaiting_forms: 2,
  awaiting_payment: 3,
  confirmed: 4,
  rejected: 5,
}

const STATUS_LABELS: Record<CandidateStatus, string> = {
  sponsored: 'Sponsored',
  pending_approval: 'Pending Approval',
  awaiting_forms: 'Awaiting Forms',
  awaiting_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
}

// ---------------------------------------------------------------------------
// Custom sort function — status by action-priority order
// ---------------------------------------------------------------------------

const statusSortingFn: SortingFn<HydratedCandidate> = (
  rowA: Row<HydratedCandidate>,
  rowB: Row<HydratedCandidate>
) => {
  const a = STATUS_ORDER[rowA.original.status] ?? 99
  const b = STATUS_ORDER[rowB.original.status] ?? 99
  return a - b
}

// ---------------------------------------------------------------------------
// Payment status helper
// ---------------------------------------------------------------------------

function getPaymentCategory(candidate: HydratedCandidate): string {
  const paid =
    candidate.payments?.reduce((sum, p) => sum + p.gross_amount, 0) ?? 0
  if (paid <= 0) return 'Unpaid'
  if (paid >= PAYMENT_CONSTANTS.CANDIDATE_FEE) return 'Paid'
  return 'Partial'
}

// ---------------------------------------------------------------------------
// Column callbacks (passed via closure from parent component)
// ---------------------------------------------------------------------------

export interface CandidateReviewColumnCallbacks {
  onSendForms: (candidate: HydratedCandidate) => void
  onSendPaymentRequest: (candidate: HydratedCandidate) => void
  onReject: (candidate: HydratedCandidate) => void
  onViewDetails: (candidate: HydratedCandidate) => void
  canEditPayments: boolean
}

// ---------------------------------------------------------------------------
// Column definitions factory
// ---------------------------------------------------------------------------

export function getCandidateReviewColumns(
  callbacks: CandidateReviewColumnCallbacks
): ColumnDef<HydratedCandidate>[] {
  return [
    {
      id: 'name',
      accessorFn: (c) =>
        c.candidate_sponsorship_info?.candidate_name ?? 'Unknown',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Candidate Name" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Candidate',
        mobilePriority: 'primary',
      },
    },
    {
      id: 'email',
      accessorFn: (c) => c.candidate_sponsorship_info?.candidate_email ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
      meta: {
        showOnMobile: true,
        mobileLabel: 'Email',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'sponsor',
      accessorFn: (c) => c.candidate_sponsorship_info?.sponsor_name ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sponsor" />
      ),
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
      meta: {
        showOnMobile: true,
        mobileLabel: 'Sponsor',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'submitted',
      accessorFn: (c) => c.created_at,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submitted" />
      ),
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Submitted',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'status',
      accessorFn: (c) => STATUS_LABELS[c.status] ?? c.status,
      header: ({ column }) => (
        <div className="flex items-center">
          <DataTableColumnHeader column={column} title="Status" />
          <Popover>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Status Reference</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Status Reference</h4>
                <StatusLegend />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
      cell: ({ row }) => <StatusChip status={row.original.status} />,
      sortingFn: statusSortingFn,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Status',
        mobilePriority: 'secondary',
      },
    },
    {
      id: 'payment',
      accessorFn: getPaymentCategory,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <CandidatePaymentInfo
            candidate={row.original}
            canEditPayments={callbacks.canEditPayments}
          />
        </div>
      ),
      enableSorting: false,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Payment',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const candidate = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => callbacks.onViewDetails(candidate)}
                  className="cursor-pointer"
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => callbacks.onSendForms(candidate)}
                  className="cursor-pointer"
                >
                  Send Forms
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => callbacks.onSendPaymentRequest(candidate)}
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
                  onClick={() => callbacks.onReject(candidate)}
                >
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        showOnMobile: false,
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Global filter function
// ---------------------------------------------------------------------------

export const candidateReviewGlobalFilterFn: FilterFn<HydratedCandidate> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (!query) return true

  const candidate = row.original
  const name = (
    candidate.candidate_sponsorship_info?.candidate_name ?? ''
  ).toLowerCase()
  const email = (
    candidate.candidate_sponsorship_info?.candidate_email ?? ''
  ).toLowerCase()
  const sponsor = (
    candidate.candidate_sponsorship_info?.sponsor_name ?? ''
  ).toLowerCase()

  return (
    name.includes(query) || email.includes(query) || sponsor.includes(query)
  )
}
