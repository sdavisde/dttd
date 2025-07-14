'use client'

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material'
import { AddToRosterModal } from './add-to-roster-modal'
import { EditRosterModal } from './edit-roster-modal'
import { RosterStatusChip } from '@/components/roster/status-chip'
import { useState } from 'react'
import { User } from '@/lib/users/types'
import { useUsers } from '@/hooks/use-users'
import { genderMatchesWeekend } from '@/lib/weekend'

type RosterTableProps = {
  roster: Array<User>
  type: 'mens' | 'womens'
  weekendId: string
}
export function RosterTable({ roster, type, weekendId }: RosterTableProps) {
  const { data: users, isLoading: loadingUsers } = useUsers()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] = useState<User | null>(null)

  const availableUsers = users?.filter((user) => {
    if (!user) return false
    const userOnRoster = !roster?.some((team_member) => team_member.id === user?.id)
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>CHA Role</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roster?.map((rosterMember) => (
            <Tooltip
              key={rosterMember.id}
              title='Click to edit roster member'
              placement='top'
            >
              <TableRow
                key={rosterMember.id}
                className='cursor-pointer hover:bg-gray-100'
                onClick={() => handleEditRosterMember(rosterMember)}
              >
                <TableCell>
                  {rosterMember.first_name} {rosterMember.last_name}
                </TableCell>
                <TableCell>{rosterMember.team_member_info?.cha_role}</TableCell>
                <TableCell>
                  <RosterStatusChip status={rosterMember.team_member_info?.status as any} />
                </TableCell>
              </TableRow>
            </Tooltip>
          ))}
          <TableRow>
            <TableCell
              colSpan={3}
              align='center'
              className='cursor-pointer hover:bg-gray-100 hover:font-bold'
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
    </TableContainer>
  )
}
