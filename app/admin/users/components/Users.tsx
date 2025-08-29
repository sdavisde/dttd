'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, User as UserIcon, Trash2, Users as UsersIcon } from 'lucide-react'
import { UserRoleSidebar } from './UserRoleSidebar'
import { User } from '@/lib/users/types'
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
import { userHasPermission } from '@/lib/security'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { Card, CardContent } from '@/components/ui/card'

interface UsersProps {
  users: User[]
  roles: Array<{ id: string; label: string; permissions: string[] }>
  canEditUsers: boolean
}

export default function Users({ users, roles, canEditUsers }: UsersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  // Enhanced fuzzy search filtering
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users

    const query = searchTerm.toLowerCase().trim()

    return users.filter((user) => {
      const name =
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase()
      const email = (user.email || '').toLowerCase()
      const phone = (user.phone_number || '').toLowerCase()
      const role = (user.role?.label || '').toLowerCase()

      // Check if query matches any field (fuzzy search)
      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query)
      )
    })
  }, [searchTerm, users])

  // Pagination setup
  const {
    paginatedData,
    pagination,
    setPage,
    setPageSize,
  } = useTablePagination(filteredUsers, {
    initialPageSize: 10,
    initialPage: 1,
  })

  const handleUserClick = (user: User) => {
    if (!canEditUsers) return

    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
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
      toast.error(res.error.message)
      return
    }

    toast.success(
      `Deleted ${userToDelete.first_name} ${userToDelete.last_name} successfully`
    )
    setUserToDelete(null)
    setIsDeleteModalOpen(false)
    router.refresh()
  }

  return (
    <div className="my-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Typography variant="h4">
            User Management
          </Typography>
          <Card className="px-3 py-1.5">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{users.length}</span>
                <span className="text-muted-foreground">total users</span>
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
            Showing {filteredUsers.length} of {users.length} users
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
                <TableHead className="sticky right-0 bg-background text-right min-w-[80px] border-l">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                  onClick={() => handleUserClick(user)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'Unknown User'}
                    </div>
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{formatPhoneNumber(user.phone_number)}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {user.role?.label || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-background text-right border-l">
                    {canEditUsers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUserClick(user)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit user role</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(user)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-700" />
                      <span className="sr-only">Delete user</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
        user={selectedUser}
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
                {userToDelete?.first_name} {userToDelete?.last_name}
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
