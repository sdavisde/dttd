'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, Settings } from 'lucide-react'
import { Role, RolesModal } from './RolesModal'
import { useRoles } from '@/hooks/use-roles'
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

export default function Roles() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: roles = [], isLoading, isError, error } = useRoles()

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matches = role.label.toLowerCase().includes(searchTerm.toLowerCase())
      return matches
    })
  }, [searchTerm, roles])

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => setIsModalOpen(false)
  const handleModalExited = () => setSelectedRole(null)

  if (isError) {
    return (
      <div className="my-4">
        <Typography variant="h4" className="mb-4">
          Roles & Permissions
        </Typography>
        <Alert variant="destructive">
          <AlertDescription>
            Error: {error instanceof Error ? error.message : 'Failed to load roles'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="my-4">
      <Typography variant="h4" className="mb-4">
        Roles & Permissions
      </Typography>

      <Typography variant="muted" className="mb-4">
        Manage system roles and their associated permissions.
      </Typography>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      {/* Roles Table */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <Typography variant="muted" className="mt-2">
            Loading roles...
          </Typography>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Permission Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role, index) => (
              <TableRow
                key={role.id}
                className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                onClick={() => handleRoleClick(role)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    {role.label}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map((permission, permIndex) => (
                      <Badge key={permIndex} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {role.permissions && role.permissions.length > 3 && (
                      <span className="text-muted-foreground text-sm">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {role.permissions?.length || 0} permission{role.permissions?.length !== 1 ? 's' : ''}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleClick(role)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit role</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No roles found matching your search.' : 'No roles found in the database.'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Role Modal */}
      <RolesModal
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
      />
    </div>
  )
}
