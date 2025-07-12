'use client'

import { Tables } from '@/database.types'
import { TeamMember } from '@/lib/weekend/types'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { AddToRosterModal } from './add-to-roster-modal'
import { useState } from 'react'

type RosterTableProps = {
  roster: Array<TeamMember & { users: Tables<'users'> | null }> | null
  type: 'mens' | 'womens'
}
export function RosterTable({ roster, type }: RosterTableProps) {
  const [open, setOpen] = useState(false)
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>CHA Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roster?.map((roster) => (
            <TableRow key={roster.id}>
              <TableCell>
                {roster.users?.first_name} {roster.users?.last_name}
              </TableCell>
              <TableCell>{roster.cha_role}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell
              colSpan={2}
              align='center'
              className='cursor-pointer hover:bg-gray-100 hover:font-bold'
              onClick={() => setOpen(true)}
            >
              + Add New Team Member
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <AddToRosterModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </TableContainer>
  )
}
