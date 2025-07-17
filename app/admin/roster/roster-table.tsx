'use client'

import { AddToRosterModal } from './add-to-roster-modal'
import { EditRosterModal } from './edit-roster-modal'
import { RosterStatusChip } from '@/components/roster/status-chip'
import { useState } from 'react'
import { User } from '@/lib/users/types'
import { useUsers } from '@/hooks/use-users'
import { genderMatchesWeekend } from '@/lib/weekend'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

type RosterTableProps = {
  roster: Array<User>
  type: 'mens' | 'womens'
  weekendId: string
}
export function RosterTable({ roster, type, weekendId }: RosterTableProps) {
  const { data: users, isLoading: loadingUsers } = useUsers()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] = useState<User | null>(
    null
  )

  const availableUsers = users?.filter((user) => {
    if (!user) return false
    const userOnRoster = !roster?.some(
      (team_member) => team_member.id === user?.id
    )
    const sameGender = genderMatchesWeekend(user?.gender ?? null, type)
    return userOnRoster && sameGender
  })

  const handleEditRosterMember = (rosterMember: User) => {
    setSelectedRosterMember(rosterMember)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRosterMember(null)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>CHA Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster?.map((rosterMember) => (
            <TableRow key={rosterMember.id}>
              <TableCell>
                {rosterMember.first_name} {rosterMember.last_name}
              </TableCell>
              <TableCell>{rosterMember.team_member_info?.cha_role}</TableCell>
              <TableCell>
                <RosterStatusChip
                  status={rosterMember.team_member_info?.status as any}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditRosterMember(rosterMember)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell
              colSpan={4}
              className="cursor-pointer text-center hover:bg-muted hover:font-bold"
              onClick={() => setAddModalOpen(true)}
            >
              + Add New Team Member
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {weekendId && (
        <AddToRosterModal
          open={addModalOpen}
          handleClose={() => setAddModalOpen(false)}
          type={type}
          users={availableUsers ?? []}
          weekendId={weekendId}
        />
      )}
      <EditRosterModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        user={selectedRosterMember}
      />
    </div>
  )
}
