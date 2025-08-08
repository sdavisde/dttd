'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/database.types'
import { Plus, Trash2 } from 'lucide-react'
import { updateRolePermissions, createRole } from '@/actions/roles'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export type Role = Database['public']['Tables']['roles']['Row']

interface RolesSidebar {
  role: Role | null
  isOpen: boolean
  onClose: () => void
  onExited?: () => void
}

export function RolesSidebar({
  role,
  isOpen,
  onClose,
  onExited,
}: RolesSidebar) {
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions || []
  )
  const [newPermission, setNewPermission] = useState('')
  const [roleName, setRoleName] = useState(role?.label || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Update permissions and role name when role changes
  useEffect(() => {
    setPermissions(role?.permissions || [])
    setRoleName(role?.label || '')
  }, [role])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setIsLoading(false)
    } else {
      // Reset form when modal closes
      setNewPermission('')
      setError(null)
      if (!role) {
        setRoleName('')
        setPermissions([])
      }
    }
  }, [isOpen, role]) // Include role in dependencies for proper reset logic

  const handleAddPermission = () => {
    if (newPermission.trim() && !permissions.includes(newPermission.trim())) {
      const updatedPermissions = [...permissions, newPermission.trim()]
      setPermissions(updatedPermissions)
      setNewPermission('')
    }
  }

  const handleRemovePermission = (permissionToRemove: string) => {
    setPermissions(permissions.filter((p) => p !== permissionToRemove))
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
          setError(result.error.message)
          return
        }
      } else {
        // Create new role
        const result = await createRole(roleName.trim(), permissions)
        if (isErr(result)) {
          setError(result.error.message)
          return
        }
      }

      toast.success(role ? 'Role updated successfully' : 'Role created successfully')
      router.refresh()
      onClose()
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save role'
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
              <AlertDescription>
                {error}
              </AlertDescription>
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
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
              {permissions.map((permission, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {permission}
                  <button
                    onClick={() => handleRemovePermission(permission)}
                    disabled={isLoading}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {permissions.length === 0 && (
                <span className="text-muted-foreground text-sm">
                  No permissions assigned
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPermission" className="text-sm font-medium">
              Add Permission
            </label>
            <div className="flex gap-2">
              <Input
                id="newPermission"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                placeholder="Add new permission..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddPermission()}
                disabled={isLoading}
              />
              <Button
                onClick={handleAddPermission}
                disabled={
                  !newPermission.trim() || isLoading
                }
                className="flex items-center gap-1 h-10"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !roleName.trim() ||
              isLoading ||
              !hasChanges
            }
          >
            {isLoading
              ? 'Saving...'
              : role
                ? 'Save Changes'
                : 'Create Role'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
