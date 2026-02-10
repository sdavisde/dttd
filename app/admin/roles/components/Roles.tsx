'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { RolesSidebar } from './RolesSidebar'
import { deleteRole, Role } from '@/services/identity/roles'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { getRolesColumns, rolesGlobalFilterFn } from '../config/columns'

interface RolesProps {
  roles: Role[]
  readOnly: boolean
}

export default function Roles({ roles, readOnly }: RolesProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const urlState = useDataTableUrlState()

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

  const columns = useMemo(
    () =>
      getRolesColumns({
        onEdit: (role) => {
          setSelectedRole(role)
          setIsModalOpen(true)
        },
        onDelete: handleDeleteRole,
        readOnly,
        isDeleting,
      }),
    [readOnly, isDeleting]
  )

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
      </div>

      <DataTable
        columns={columns}
        data={roles}
        user={null}
        globalFilterFn={rolesGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search roles..."
        onRowClick={readOnly ? undefined : handleRoleClick}
        toolbarChildren={
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
        }
        emptyState={{
          noData: 'No roles found in the database.',
          noResults: 'No roles found matching your search.',
        }}
      />

      <RolesSidebar
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
        readOnly={readOnly}
      />

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
