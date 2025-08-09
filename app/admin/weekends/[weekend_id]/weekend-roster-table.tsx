'use client'

import { useState } from 'react'
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
import { Edit } from 'lucide-react'
import { EditTeamMemberModal } from './edit-team-member-modal'

type RosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
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

export function WeekendRosterTable({ roster, isEditable }: WeekendRosterTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] = useState<RosterMember | null>(null)

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role'
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleEditRosterMember = (rosterMember: RosterMember) => {
    setSelectedRosterMember(rosterMember)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRosterMember(null)
  }

  return (
    <>
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold min-w-[200px]">Name</TableHead>
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
              {roster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEditable ? 6 : 5} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No team members assigned to this weekend.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                roster.map((member, index) => (
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
                      {member.users?.email || 'No email'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.users?.phone_number || 'No phone'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatRole(member.cha_role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'paid'
                            ? 'default'
                            : member.status === 'confirmed'
                              ? 'outline'
                              : 'secondary'
                        }
                      >
                        {member.status || 'Unknown'}
                      </Badge>
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

      <EditTeamMemberModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        rosterMember={selectedRosterMember}
      />
    </>
  )
}