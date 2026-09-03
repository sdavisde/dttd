'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { RolesSidebar } from './RolesSidebar'
import type { Role } from '@/services/identity/roles'
import { deleteRole } from '@/services/identity/roles'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { getRolesColumns, rolesGlobalFilterFn } from '../config/columns'
import { isNil } from 'lodash'

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
    if (isNil(roleToDelete)) return

    setIsDeleting(true)

    try {
      const result = await deleteRole(roleToDelete.id)
      if (isErr(result)) {
        toastError('Unable to delete role. Please try again.', {
          error: result.error,
        })
        return
      }

      toast.success(`Deleted role "${roleToDelete.label}" successfully`)
      router.refresh()
      setDeleteConfirmOpen(false)
      setRoleToDelete(null)
    } catch (error) {
      toastError('Unable to delete role. Please try again.', { error })
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
    <div>
      <PageHeader
        title="Security"
        description="Define what each role can do — roles are assigned to people on the People page."
      >
        <Button
          onClick={handleCreateRole}
          variant="outline"
          disabled={readOnly}
        >
          <Plus className="h-4 w-4" />
          New role
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={roles}
        user={null}
        globalFilterFn={rolesGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search roles..."
        onRowClick={readOnly ? undefined : handleRoleClick}
        appearance={{
          zebra: false,
          container: 'bg-card overflow-hidden [&_tbody_tr]:border-divider',
          header:
            'h-auto px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground [&_button]:h-7 [&_button]:text-xs [&_button]:font-semibold [&_button]:uppercase [&_button]:tracking-wider [&_button]:text-muted-foreground',
        }}
        emptyState={{
          noData: 'No roles found in the database.',
          noResults: 'No roles found matching your search.',
        }}
      />

      <p className="mt-3 text-[13px] text-muted-foreground">
        {roles.length} roles · board positions and committees are roles too ·
        people get their roles on the People page
      </p>

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
