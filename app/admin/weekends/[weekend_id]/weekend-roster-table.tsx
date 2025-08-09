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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, Search, ChevronDown } from 'lucide-react'
import { EditTeamMemberModal } from './edit-team-member-modal'
import { CHARole } from '@/lib/weekend/types'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'

type RosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
}

type WeekendRosterTableProps = {
  roster: Array<RosterMember>
  isEditable: boolean
}

export function WeekendRosterTable({
  roster,
  isEditable,
}: WeekendRosterTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] =
    useState<RosterMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const formatRole = (role: string | null) => {
    if (!role) return '-'
    return role
  }

  // Get sort order based on CHARole enum position
  const getRoleSortOrder = (role: string | null) => {
    if (!role) return 999 // Put null roles at the end
    const roleValues = Object.values(CHARole)
    const index = roleValues.indexOf(role as CHARole)
    return index === -1 ? 998 : index // Unknown roles near the end
  }

  const handleEditRosterMember = (rosterMember: RosterMember) => {
    setSelectedRosterMember(rosterMember)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRosterMember(null)
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
    member: RosterMember,
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

        {/* Table */}
        <div className="relative">
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
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  {isEditable && (
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoster.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isEditable ? 6 : 5}
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
                  filteredRoster.map((member, index) => (
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
        </div>
      </div>

      <EditTeamMemberModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        rosterMember={selectedRosterMember}
      />
    </>
  )
}
