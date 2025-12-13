'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/database.types'
import { updateRolePermissions, createRole } from '@/actions/roles'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { Permission } from '@/lib/security'
import Select, { MultiValue } from 'react-select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export type Role = Database['public']['Tables']['roles']['Row']

interface RolesSidebar {
  role: Role | null
  isOpen: boolean
  onClose: () => void
  onExited?: () => void
}

interface PermissionOption {
  value: string
  label: string
}

const permissionOptions: PermissionOption[] = Object.values(Permission).map(
  (permission) => ({
    value: permission,
    label: permission,
  })
)

export function RolesSidebar({
  role,
  isOpen,
  onClose,
}: RolesSidebar) {
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? []
  )
  const [roleName, setRoleName] = useState(role?.label ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Update permissions and role name when role changes
  useEffect(() => {
    setPermissions(role?.permissions ?? [])
    setRoleName(role?.label ?? '')
  }, [role])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setIsLoading(false)
    } else {
      // Reset form when modal closes
      setError(null)
      if (!role) {
        setRoleName('')
        setPermissions([])
      }
    }
  }, [isOpen, role]) // Include role in dependencies for proper reset logic

  const handlePermissionsChange = (
    selectedOptions: MultiValue<PermissionOption>
  ) => {
    setPermissions(selectedOptions.map((option) => option.value))
  }

  const handleSave = async () => {
    if (!roleName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      if (role) {
        // Update existing role
        const result = await updateRolePermissions(role.id, permissions)
        if (isErr(result)) {
          setError(result.error)
          return
        }
      } else {
        // Create new role
        const result = await createRole(roleName.trim(), permissions)
        if (isErr(result)) {
          setError(result.error)
          return
        }
      }

      toast.success(
        role ? 'Role updated successfully' : 'Role created successfully'
      )
      router.refresh()
      onClose()
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to save role'
      setError(errorMessage)
      logger.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if anything has changed for existing roles
  const hasChanges = role
    ? JSON.stringify(permissions.sort()) !==
    JSON.stringify((role.permissions || []).sort())
    : roleName.trim() !== '' || permissions.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {role ? `Edit Role: ${role.label}` : 'Create New Role'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 p-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!role && (
            <div className="space-y-2">
              <label htmlFor="roleName" className="text-sm font-medium">
                Role Name
              </label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name..."
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Permissions</label>
            <Select
              isMulti
              options={permissionOptions}
              value={permissionOptions.filter((option) =>
                permissions.includes(option.value)
              )}
              onChange={handlePermissionsChange}
              placeholder="Select permissions..."
              isDisabled={isLoading}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!roleName.trim() || isLoading || !hasChanges}
          >
            {isLoading ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
