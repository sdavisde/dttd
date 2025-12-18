'use client'

import { useState, useMemo } from 'react'
import { Search, Edit, Settings, Trash2, Plus } from 'lucide-react'
import { RolesSidebar } from './RolesSidebar'
import { deleteRole, Role } from '@/services/identity/roles'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
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
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { Permission } from '@/lib/security'

interface RolesProps {
  roles: Array<{ id: string; label: string; permissions: Permission[] }>
  readOnly: boolean
}

export default function Roles({ roles, readOnly }: RolesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matches = role.label
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matches
    })
  }, [searchTerm, roles])

  const handleRoleClick = (role: Role) => {
    if (readOnly) return
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setIsModalOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    setIsDeleting(true)

    try {
      const result = await deleteRole(roleToDelete.id)
      if (isErr(result)) {
        toast.error(result.error)
        return
      }

      toast.success(`Deleted role "${roleToDelete.label}" successfully`)
      router.refresh()
      setDeleteConfirmOpen(false)
      setRoleToDelete(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete role'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteRole = () => {
    setDeleteConfirmOpen(false)
    setRoleToDelete(null)
  }

  const handleCloseModal = () => setIsModalOpen(false)
  const handleModalExited = () => setSelectedRole(null)

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Typography variant="h4" className="mb-2">
            Roles & Permissions
          </Typography>
          <Typography variant="muted">
            Manage system roles and their associated permissions.
          </Typography>
        </div>
        <Button
          onClick={handleCreateRole}
          size="sm"
          variant="ghost"
          className="flex items-center gap-2"
          disabled={readOnly}
        >
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold min-w-[150px]">Role</TableHead>
                <TableHead className="min-w-[200px]">Permissions</TableHead>
                <TableHead className="min-w-[120px]">
                  Permission Count
                </TableHead>
                <TableHead className="sticky right-0 bg-background text-right min-w-[120px] border-l">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role, index) => (
                <TableRow
                  key={role.id}
                  className={`hover:bg-muted/50 ${
                    !readOnly && 'cursor-pointer'
                  } ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
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
                      {role.permissions
                        ?.slice(0, 3)
                        .map((permission, permIndex) => (
                          <Badge
                            key={permIndex}
                            variant="outline"
                            className="text-xs"
                          >
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
                    {role.permissions?.length || 0} permission
                    {role.permissions?.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-background text-right border-l">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRoleClick(role)
                      }}
                      className="h-8 w-8 p-0"
                      disabled={readOnly}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit role</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRole(role)
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={isDeleting || readOnly}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete role</span>
                    </Button>{' '}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'No roles found matching your search.'
                        : 'No roles found in the database.'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Role Sidebar */}
      <RolesSidebar
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
        readOnly={readOnly}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Delete Role"
        itemName={roleToDelete?.label}
        isDeleting={isDeleting}
        onCancel={cancelDeleteRole}
        onConfirm={confirmDeleteRole}
        confirmText="Delete Role"
      />
    </div>
  )
}
