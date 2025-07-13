'use client'

import { Tables } from '@/database.types'
import { TeamMember } from '@/lib/weekend/types'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material'
import { AddToRosterModal } from './add-to-roster-modal'
import { EditRosterModal } from './edit-roster-modal'
import { RosterStatusChip } from '@/components/roster/status-chip'
import { useState } from 'react'

type RosterTableProps = {
  roster: Array<TeamMember>
  type: 'mens' | 'womens'
  users: Array<Tables<'users'> | null>
  weekendId: string
}
export function RosterTable({ roster, type, users, weekendId }: RosterTableProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] = useState<TeamMember | null>(null)

  const unassignedUsers = users.filter((user) => {
    if (!user) return false
    const userOnRoster = !roster?.some((roster) => roster.user_id === user?.id)
    const sameGender = (type === 'mens' && user?.gender === 'male') || (type === 'womens' && user?.gender === 'female')
    return userOnRoster && sameGender
  })

  const handleEditRosterMember = (rosterMember: TeamMember) => {
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
                  {rosterMember.users.first_name} {rosterMember.users.last_name}
                </TableCell>
                <TableCell>{rosterMember.cha_role}</TableCell>
                <TableCell>
                  <RosterStatusChip status={rosterMember.status as any} />
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
          users={unassignedUsers}
          weekendId={weekendId}
        />
      )}
      <EditRosterModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        rosterMember={selectedRosterMember}
      />
    </TableContainer>
  )
}
