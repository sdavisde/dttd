'use client'

import { useState } from 'react'
import { Users as UsersIcon } from 'lucide-react'
import { UserRoleSidebar } from './UserRoleSidebar'
import { User } from '@/lib/users/types'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import type {
  MasterRoster as MasterRosterType,
  MasterRosterMember,
} from '@/services/master-roster/types'
import { deleteUser } from '@/services/identity/user'
import {
  masterRosterColumns,
  masterRosterGlobalFilterFn,
} from '../config/columns'

interface MasterRosterProps {
  masterRoster: MasterRosterType
  roles: Array<{ id: string; label: string; permissions: string[] }>
  canViewExperience: boolean
}

export default function MasterRoster({
  masterRoster,
  roles,
  canViewExperience,
}: MasterRosterProps) {
  const [selectedMember, setSelectedMember] =
    useState<MasterRosterMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  const urlState = useDataTableUrlState({ defaultPageSize: 25 })

  const handleMemberClick = (member: MasterRosterMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedMember(null)
    setIsModalOpen(false)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCancel = () => {
    setUserToDelete(null)
    setIsDeleteModalOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    const res = await deleteUser(userToDelete.id)
    if (res.error) {
      toast.error(res.error)
      return
    }

    toast.success(
      `Deleted ${userToDelete.firstName} ${userToDelete.lastName} successfully`
    )
    setUserToDelete(null)
    setIsDeleteModalOpen(false)
    router.refresh()
  }

  return (
    <div className="my-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Typography variant="h4">Master Roster</Typography>
          <Card className="px-3 py-1.5">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {masterRoster.members.length}
                </span>
                <span className="text-muted-foreground">total members</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Typography variant="muted">
          Manage user roles and permissions. Click on a user to assign or change
          their role.
        </Typography>
      </div>

      <DataTable
        columns={masterRosterColumns}
        data={masterRoster.members}
        user={null}
        globalFilterFn={masterRosterGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search users by name, email, phone, or role"
        onRowClick={handleMemberClick}
        columnVisibility={{
          level: canViewExperience,
          rectorReady: canViewExperience,
        }}
        emptyState={{
          noData: 'No users found in the system.',
          noResults: 'No users found matching your search.',
        }}
      />

      <UserRoleSidebar
        member={selectedMember}
        roles={roles}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>
              ? This action cannot be undone and will permanently remove the
              user and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
