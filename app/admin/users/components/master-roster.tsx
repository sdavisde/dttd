'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Edit,
  User as UserIcon,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react'
import { UserRoleSidebar } from './UserRoleSidebar'
import { User } from '@/lib/users/types'
import { UserServiceHistory } from '@/lib/users/experience'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { formatPhoneNumber } from '@/lib/utils'
import { deleteUser } from '@/actions/users'
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
import { Permission, userHasPermission } from '@/lib/security'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isEmpty, isNil } from 'lodash'
import type {
  MasterRoster,
  MasterRosterMember,
} from '@/services/master-roster/types'
import { useSession } from '@/components/auth/session-provider'

interface MasterRosterProps {
  masterRoster: MasterRoster
  roles: Array<{ id: string; label: string; permissions: string[] }>
  canViewExperience: boolean
  userExperienceMap: Map<string, UserServiceHistory>
}

export default function MasterRoster({
  masterRoster,
  roles,
  canViewExperience,
  userExperienceMap,
}: MasterRosterProps) {
  const { user } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] =
    useState<MasterRosterMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  // Enhanced fuzzy search filtering
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return masterRoster.members

    const query = searchTerm.toLowerCase().trim()

    return masterRoster.members.filter((user) => {
      const name =
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase()
      const email = (user.email ?? '').toLowerCase()
      const phone = (user.phoneNumber ?? '').toLowerCase()
      const roles = user.roles ?? []

      // Check if query matches any field (fuzzy search)
      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        roles.includes(query)
      )
    })
  }, [searchTerm, masterRoster.members])

  // Pagination setup
  const { paginatedData, pagination, setPage, setPageSize } =
    useTablePagination(filteredUsers, {
      initialPageSize: 10,
      initialPage: 1,
    })

  const handleMemberClick = (rosterMember: MasterRosterMember) => {
    setSelectedMember(rosterMember)
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
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name, email, phone, or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Summary */}
        {searchTerm.trim() && (
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredUsers.length} of {masterRoster.members.length}{' '}
            users
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[100px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[120px]">Role</TableHead>
                {canViewExperience && (
                  <>
                    <TableHead className="min-w-[80px] text-center">
                      Level
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">
                      Rector Ready
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">
                      Weekends
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((member, index) => {
                const userExperience = userExperienceMap.get(member.id)
                return (
                  <TableRow
                    key={member.id}
                    className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                    onClick={() => handleMemberClick(member)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        {(member.firstName ?? member.lastName)
                          ? `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
                          : 'Unknown User'}
                      </div>
                    </TableCell>
                    <TableCell>{member.email ?? '-'}</TableCell>
                    <TableCell>
                      {formatPhoneNumber(member.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {isEmpty(member.roles) ? '-' : member.roles.join(', ')}
                      </span>
                    </TableCell>
                    {canViewExperience && (
                      <>
                        <TableCell className="text-center">
                          {!isNil(userExperience) ? (
                            <Badge
                              variant="secondary"
                              className={`font-semibold ${
                                userExperience.level === 1
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : userExperience.level === 2
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }`}
                            >
                              {userExperience.level}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {!isNil(userExperience) ? (
                            userExperience.rectorReady.isReady ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {!isNil(userExperience) ? (
                            <span className="font-medium">
                              {userExperience.totalWeekends}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canViewExperience ? 8 : 5}
                    className="text-center py-8"
                  >
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'No users found matching your search.'
                        : 'No users found in the system.'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* User Role Sidebar */}
      <UserRoleSidebar
        member={selectedMember}
        roles={roles}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
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
