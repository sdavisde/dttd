'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, User as UserIcon, Trash2 } from 'lucide-react'
import { UserRoleSidebar } from './UserRoleSidebar'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatPhoneNumber } from '@/lib/utils'

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
      const emailMatch = user.email?.toLowerCase().includes(searchLower)
      const phoneMatch = user.phone_number?.toLowerCase().includes(searchLower)

      return firstNameMatch || lastNameMatch || emailMatch || phoneMatch
    })
  }, [searchTerm, users])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {}

  const handleCloseModal = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  if (isError) {
    return (
      <div className="my-4">
        <Typography variant="h4" className="mb-4">
          User Management
        </Typography>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load user data'}
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center p-8 text-center">
          <div className="flex flex-col justify-center items-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <Typography variant="muted" className="mt-2">
              Loading users...
            </Typography>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold min-w-[150px]">
                    Name
                  </TableHead>
                  <TableHead className="min-w-[100px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Phone</TableHead>
                  <TableHead className="sticky right-0 bg-background text-right min-w-[80px] border-l">
                    Actions
                  </TableHead>
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
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      {formatPhoneNumber(user.phone_number)}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background text-right border-l">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUserClick(user)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-700" />
                        <span className="sr-only">Delete user</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
        </div>
      )}

      {/* User Role Sidebar */}
      <UserRoleSidebar
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
