'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, User as UserIcon } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

// Format phone number to xxx-xxx-xxxx format
const formatPhoneNumber = (phoneNumber: string | null): string => {
  if (!phoneNumber) return '-'
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Check if it's a valid US phone number (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // If it's 11 digits and starts with 1, format as US number
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  // Otherwise, return the original
  return phoneNumber
}

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
      const roleMatch = user.role?.label.toLowerCase().includes(searchLower)
      const chaRoleMatch = user.team_member_info?.cha_role
        ?.toLowerCase()
        .includes(searchLower)
      const statusMatch = user.team_member_info?.status
        ?.toLowerCase()
        .includes(searchLower)

      return (
        firstNameMatch ||
        lastNameMatch ||
        emailMatch ||
        phoneMatch ||
        roleMatch ||
        chaRoleMatch ||
        statusMatch
      )
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
                  <TableHead className="min-w-[80px]">Gender</TableHead>
                  <TableHead className="min-w-[120px]">Role</TableHead>
                  <TableHead className="min-w-[120px]">CHA Role</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
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
                    <TableCell>{formatPhoneNumber(user.phone_number)}</TableCell>
                    <TableCell>{user.gender || '-'}</TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant="outline">{user.role.label}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No role</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.team_member_info?.cha_role ? (
                        <Badge variant="secondary">
                          {user.team_member_info.cha_role.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.team_member_info?.status ? (
                        <Badge
                          variant={
                            user.team_member_info.status === 'ACTIVE'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {user.team_member_info.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
        onExited={handleModalExited}
      />
    </div>
  )
}
