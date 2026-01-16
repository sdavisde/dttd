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
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { CHARole } from '@/lib/weekend/types'
import { WeekendRosterMember } from '@/services/weekend'

type DroppedRosterTableProps = {
  roster: Array<WeekendRosterMember>
}

export function DroppedRosterTable({ roster }: DroppedRosterTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const formatRole = (role: string | null) => role ?? '-'

  // Get sort order based on CHARole enum position
  const getRoleSortOrder = (role: string | null) => {
    if (!role) return 999 // Put null roles at the end
    const roleValues = Object.values(CHARole)
    const index = roleValues.indexOf(role as CHARole)
    return index === -1 ? 998 : index // Unknown roles near the end
  }

  // Filter only dropped members and apply search
  const filteredRoster = useMemo(() => {
    let result = roster

    // Only show dropped members
    result = result.filter((member) => member.status === 'drop')

    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()

      result = result.filter((member) => {
        const name =
          `${member.users?.first_name ?? ''} ${member.users?.last_name ?? ''}`.toLowerCase()
        const email = (member.users?.email ?? '').toLowerCase()
        const phone = (member.users?.phone_number ?? '').toLowerCase()
        const role = formatRole(member.cha_role).toLowerCase()
        const rollo = (member.rollo ?? '').toLowerCase()

        // Check if query matches any field (fuzzy search)
        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          role.includes(query) ||
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
        `${a.users?.first_name ?? ''} ${a.users?.last_name ?? ''}`.toLowerCase()
      const nameB =
        `${b.users?.first_name ?? ''} ${b.users?.last_name ?? ''}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [roster, searchQuery])

  // Pagination setup
  const { paginatedData, pagination, setPage, setPageSize } =
    useTablePagination(filteredRoster, {
      initialPageSize: 10,
      initialPage: 1,
    })

  if (filteredRoster.length === 0 && !searchQuery) {
    return null // Don't render anything if no dropped members
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search dropped members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Rollo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? 'No dropped members found matching your search.'
                      : 'No dropped members.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">
                        {member.users?.first_name} {member.users?.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.users?.email ?? '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.users?.phone_number ?? '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatRole(member.cha_role)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.rollo ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Dropped</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card Layout - Shown only on mobile */}
        <div className="md:hidden space-y-3">
          {paginatedData.length === 0 ? (
            <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
              {searchQuery
                ? 'No dropped members found matching your search.'
                : 'No dropped members.'}
            </div>
          ) : (
            paginatedData.map((member) => (
              <div
                key={member.id}
                className="bg-card border rounded-lg p-4 space-y-3"
              >
                {/* Header with name and status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      {member.users?.first_name} {member.users?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.users?.email}
                    </p>
                  </div>
                  <Badge variant="destructive">Dropped</Badge>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">Phone:</span>
                    <span>{member.users?.phone_number ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">Role:</span>
                    <span className="font-medium">
                      {formatRole(member.cha_role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">Rollo:</span>
                    <span>{member.rollo ?? '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredRoster.length > 0 && (
          <TablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </div>
    </>
  )
}
