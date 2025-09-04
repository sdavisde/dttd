'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit, Search, ChevronDown, Info } from 'lucide-react'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { EditTeamMemberModal } from './edit-team-member-modal'
import { PaymentInfoModal } from './payment-info-modal'
import { CashCheckPaymentModal } from './cash-check-payment-modal'
import { CHARole } from '@/lib/weekend/types'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { useRouter } from 'next/navigation'
import { WeekendRosterMember } from '@/actions/weekend'

type WeekendRosterTableProps = {
  roster: Array<WeekendRosterMember>
  isEditable: boolean
  /** Whether to include payment/status information (defaults to true) */
  includePaymentInformation?: boolean
}

export function WeekendRosterTable({
  roster,
  isEditable,
  includePaymentInformation = true,
}: WeekendRosterTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] =
    useState<WeekendRosterMember | null>(null)
  const [paymentInfoModalOpen, setPaymentInfoModalOpen] = useState(false)
  const [selectedPaymentMember, setSelectedPaymentMember] =
    useState<WeekendRosterMember | null>(null)
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState(false)
  const [selectedCashCheckMember, setSelectedCashCheckMember] =
    useState<WeekendRosterMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const formatRole = (role: string | null) => role ?? '-'

  // Get sort order based on CHARole enum position
  const getRoleSortOrder = (role: string | null) => {
    if (!role) return 999 // Put null roles at the end
    const roleValues = Object.values(CHARole)
    const index = roleValues.indexOf(role as CHARole)
    return index === -1 ? 998 : index // Unknown roles near the end
  }

  const handleEditRosterMember = (rosterMember: WeekendRosterMember) => {
    setSelectedRosterMember(rosterMember)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRosterMember(null)
  }

  const handleShowPaymentInfo = (rosterMember: WeekendRosterMember) => {
    setSelectedPaymentMember(rosterMember)
    setPaymentInfoModalOpen(true)
  }

  const handleClosePaymentInfoModal = () => {
    setPaymentInfoModalOpen(false)
    setSelectedPaymentMember(null)
  }

  const handleShowCashCheckModal = (rosterMember: WeekendRosterMember) => {
    setSelectedCashCheckMember(rosterMember)
    setCashCheckModalOpen(true)
  }

  const handleCloseCashCheckModal = () => {
    setCashCheckModalOpen(false)
    setSelectedCashCheckMember(null)
  }

  // Format payment summary for display
  const formatPaymentSummary = (member: WeekendRosterMember) => {
    const totalFee = PAYMENT_CONSTANTS.TEAM_FEE
    const paid = member.total_paid || 0
    const balance = totalFee - paid

    return {
      paid,
      balance,
      display: `$${paid.toFixed(0)}`,
      isPaidInFull: balance <= 0,
    }
  }

  // Status options for the dropdown
  const statusOptions = [
    {
      value: 'awaiting_payment',
      label: 'Awaiting Payment',
      color: 'warning' as const,
    },
    { value: 'paid', label: 'Paid', color: 'success' as const },
    { value: 'drop', label: 'Drop', color: 'error' as const },
  ]

  // Handle status update
  const handleStatusUpdate = async (
    member: WeekendRosterMember,
    newStatus: string
  ) => {
    try {
      const client = createClient()

      const { error } = await client
        .from('weekend_roster')
        .update({ status: newStatus })
        .eq('id', member.id)

      if (isSupabaseError(error)) {
        logger.error(error, '💢 failed to update roster member status')
        return
      }

      router.refresh()
    } catch (error) {
      logger.error(error, '💢 unexpected error updating roster member status')
    }
  }

  // Fuzzy search filtering and sorting
  const filteredRoster = useMemo(() => {
    let result = roster

    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()

      result = roster.filter((member) => {
        const name =
          `${member.users?.first_name || ''} ${member.users?.last_name || ''}`.toLowerCase()
        const email = (member.users?.email || '').toLowerCase()
        const phone = (member.users?.phone_number || '').toLowerCase()
        const role = formatRole(member.cha_role).toLowerCase()
        const status = (member.status || '').toLowerCase()
        const rollo = (member.rollo || '').toLowerCase()

        // Check if query matches any field (fuzzy search)
        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          role.includes(query) ||
          status.includes(query) ||
          rollo.includes(query)
        )
      })
    }

    // Sort by CHA role enum order, then by name
    return result.sort((a, b) => {
      const roleOrderA = getRoleSortOrder(a.cha_role)
      const roleOrderB = getRoleSortOrder(b.cha_role)

      if (roleOrderA !== roleOrderB) {
        return roleOrderA - roleOrderB
      }

      // If same role, sort by name
      const nameA =
        `${a.users?.first_name || ''} ${a.users?.last_name || ''}`.toLowerCase()
      const nameB =
        `${b.users?.first_name || ''} ${b.users?.last_name || ''}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [roster, searchQuery])

  // Pagination setup
  const { paginatedData, pagination, setPage, setPageSize } =
    useTablePagination(filteredRoster, {
      initialPageSize: 10,
      initialPage: 1,
    })

  // Calculate total columns for colspan
  // Updated calculation after removing status column
  const totalColumns =
    (includePaymentInformation ? 4 : 3) + (isEditable ? 1 : 0)

  return (
    <>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members by name, email, phone, role, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Summary */}
        {searchQuery.trim() && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredRoster.length} of {roster.length} team members
          </div>
        )}

        {/* Desktop Table - Hidden on mobile */}
        <div className="relative hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold min-w-[200px]">
                    Name
                  </TableHead>
                  <TableHead className="min-w-[150px]">Email</TableHead>
                  <TableHead className="min-w-[150px]">Phone</TableHead>
                  <TableHead className="min-w-[150px]">Role</TableHead>
                  {includePaymentInformation && (
                    <>
                      <TableHead className="min-w-[100px]">Payment</TableHead>
                      {/* Status column temporarily removed for cash/check payment implementation */}
                      {/* <TableHead className="min-w-[100px]">Status</TableHead> */}
                    </>
                  )}
                  {isEditable && (
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      className="text-center py-8"
                    >
                      <p className="text-muted-foreground">
                        {roster.length === 0
                          ? 'No team members assigned to this weekend.'
                          : searchQuery.trim()
                            ? 'No team members found matching your search.'
                            : 'No team members assigned to this weekend.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((member, index) => (
                    <TableRow
                      key={member.id}
                      className={`hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                    >
                      <TableCell className="font-medium">
                        {member.users?.first_name && member.users?.last_name
                          ? `${member.users.first_name} ${member.users.last_name}`
                          : 'Unknown User'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.users?.email || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.users?.phone_number || '-'}
                      </TableCell>
                      <TableCell>
                        <span>{formatRole(member.cha_role)}</span>
                        {member.rollo && (
                          <span className="ms-1">- {member.rollo}</span>
                        )}
                      </TableCell>
                      {includePaymentInformation && (
                        <>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-auto p-1 hover:bg-muted text-left rounded-lg w-12"
                                onClick={() =>
                                  isEditable
                                    ? handleShowCashCheckModal(member)
                                    : handleShowPaymentInfo(member)
                                }
                                title={
                                  isEditable
                                    ? 'Record payment'
                                    : 'View payment information'
                                }
                              >
                                <span
                                  className={`text-sm font-medium ${
                                    formatPaymentSummary(member).paid > 0
                                      ? 'text-green-600'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {formatPaymentSummary(member).display}
                                </span>
                              </Button>
                              {member.all_payments.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 hover:bg-muted rounded-full transition-colors"
                                  onClick={() => handleShowPaymentInfo(member)}
                                  title="View payment details"
                                >
                                  <Info className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          {/* Status column temporarily removed for cash/check payment implementation */}
                          {/*
                          <TableCell>
                            {isEditable ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 hover:bg-transparent"
                                  >
                                    <Badge
                                      color={
                                        member.status === 'paid'
                                          ? 'success'
                                          : member.status === 'awaiting_payment'
                                            ? 'warning'
                                            : 'error'
                                      }
                                      className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                                    >
                                      {statusOptions.find(
                                        (opt) => opt.value === member.status
                                      )?.label ||
                                        member.status ||
                                        'Unknown'}
                                      <ChevronDown className="h-3 w-3" />
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {statusOptions.map((option) => (
                                    <DropdownMenuItem
                                      key={option.value}
                                      onClick={() =>
                                        handleStatusUpdate(member, option.value)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <Badge
                                        color={option.color}
                                        className="text-xs"
                                      >
                                        {option.label}
                                      </Badge>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Badge
                                color={
                                  member.status === 'paid'
                                    ? 'success'
                                    : member.status === 'awaiting_payment'
                                      ? 'warning'
                                      : 'error'
                                }
                              >
                                {statusOptions.find(
                                  (opt) => opt.value === member.status
                                )?.label ||
                                  member.status ||
                                  'Unknown'}
                              </Badge>
                            )}
                          </TableCell>
                          */}
                        </>
                      )}
                      {isEditable && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRosterMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Desktop Pagination */}
          <TablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* Mobile Card Layout - Shown only on mobile */}
        <div className="md:hidden space-y-3">
          {paginatedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {roster.length === 0
                  ? 'No team members assigned to this weekend.'
                  : searchQuery.trim()
                    ? 'No team members found matching your search.'
                    : 'No team members assigned to this weekend.'}
              </p>
            </div>
          ) : (
            paginatedData.map((member) => (
              <div
                key={member.id}
                className="bg-card border rounded-lg p-4 space-y-3"
              >
                {/* Name and Actions Header */}
                <div className="flex items-center justify-between">
                  <div className="font-medium text-lg">
                    {member.users?.first_name && member.users?.last_name
                      ? `${member.users.first_name} ${member.users.last_name}`
                      : 'Unknown User'}
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRosterMember(member)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground w-16">Email:</span>
                    <span className="text-foreground">
                      {member.users?.email || '-'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground w-16">Phone:</span>
                    <span className="text-foreground">
                      {member.users?.phone_number || '-'}
                    </span>
                  </div>
                </div>

                {/* Role and Status */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant="outline">
                    {formatRole(member.cha_role)}
                    {member.rollo && ` - ${member.rollo}`}
                  </Badge>

                  {includePaymentInformation && (
                    <>
                      {/* Status Badge - temporarily removed for cash/check payment implementation */}
                      {/*
                      {isEditable ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                            >
                              <Badge
                                color={
                                  member.status === 'paid'
                                    ? 'success'
                                    : member.status === 'awaiting_payment'
                                      ? 'warning'
                                      : 'error'
                                }
                                className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                              >
                                {statusOptions.find(
                                  (opt) => opt.value === member.status
                                )?.label ||
                                  member.status ||
                                  'Unknown'}
                                <ChevronDown className="h-3 w-3" />
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  handleStatusUpdate(member, option.value)
                                }
                                className="flex items-center gap-2"
                              >
                                <Badge color={option.color} className="text-xs">
                                  {option.label}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge
                          color={
                            member.status === 'paid'
                              ? 'success'
                              : member.status === 'awaiting_payment'
                                ? 'warning'
                                : 'error'
                          }
                        >
                          {statusOptions.find(
                            (opt) => opt.value === member.status
                          )?.label ||
                            member.status ||
                            'Unknown'}
                        </Badge>
                      )}
                      */}

                      {/* Payment Summary for Mobile */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 hover:bg-muted"
                          onClick={() =>
                            isEditable
                              ? handleShowCashCheckModal(member)
                              : handleShowPaymentInfo(member)
                          }
                          title={
                            isEditable
                              ? 'Record payment'
                              : 'View payment information'
                          }
                        >
                          <span
                            className={`text-sm font-medium ${
                              formatPaymentSummary(member).isPaidInFull
                                ? 'text-green-600'
                                : formatPaymentSummary(member).paid > 0
                                  ? 'text-amber-600'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {formatPaymentSummary(member).display}
                          </span>
                        </Button>
                        {member.all_payments.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 hover:bg-muted"
                            onClick={() => handleShowPaymentInfo(member)}
                            title="View payment details"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="ml-1 text-xs">Details</span>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Mobile Pagination */}
          <TablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>

      <EditTeamMemberModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        rosterMember={selectedRosterMember}
      />

      <PaymentInfoModal
        open={paymentInfoModalOpen}
        onClose={handleClosePaymentInfoModal}
        rosterMember={selectedPaymentMember}
      />

      <CashCheckPaymentModal
        open={cashCheckModalOpen}
        onClose={handleCloseCashCheckModal}
        rosterMember={selectedCashCheckMember}
      />
    </>
  )
}
