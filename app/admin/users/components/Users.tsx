'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, User as UserIcon } from 'lucide-react'
import { UserRoleModal } from './UserRoleModal'
import { useUsers } from '@/hooks/use-users'
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
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: users = [], isLoading, isError, error } = useUsers()

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase()
      const firstNameMatch = user.first_name
        ?.toLowerCase()
        .includes(searchLower)
      const lastNameMatch = user.last_name?.toLowerCase().includes(searchLower)
      const roleMatch = user.role?.label.toLowerCase().includes(searchLower)
      return firstNameMatch || lastNameMatch || roleMatch
    })
  }, [searchTerm, users])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleModalExited = () => {
    setSelectedUser(null)
  }

  if (isError) {
    return (
      <div className="my-4">
        <Typography variant="h4" className="mb-4">
          User Management
        </Typography>
        <Alert variant="destructive">
          <AlertDescription>
            Error:{' '}
            {error instanceof Error ? error.message : 'Failed to load data'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="my-4">
      <Typography variant="h4" className="mb-4">
        User Management
      </Typography>

      <Typography variant="muted" className="mb-4">
        Manage user roles and permissions. Click on a user to assign or change
        their role.
      </Typography>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <Typography variant="muted" className="mt-2">
            Loading users...
          </Typography>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
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
                <TableCell>{user.gender || '-'}</TableCell>
                <TableCell>
                  {user.role ? (
                    <Badge variant="outline">{user.role.label}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No role</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
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
      )}

      {/* User Role Modal */}
      <UserRoleModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
      />
    </div>
  )
}
