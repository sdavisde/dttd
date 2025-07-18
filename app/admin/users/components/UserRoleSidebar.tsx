'use client'

import { useState, useEffect } from 'react'
import { useRoles } from '@/hooks/use-roles'
import { useAssignUserRole, useRemoveUserRole } from '@/hooks/use-users'
import { User } from '@/lib/users/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPhoneNumber } from '@/lib/utils'

interface UserRoleSidebarProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserRoleSidebar({
  user,
  isOpen,
  onClose,
}: UserRoleSidebarProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  const { data: roles = [] } = useRoles()
  const assignUserRoleMutation = useAssignUserRole()
  const removeUserRoleMutation = useRemoveUserRole()

  // Update selected role when user changes
  useEffect(() => {
    setSelectedRoleId(user?.role?.id ?? null)
  }, [user])

  // Reset mutation state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      assignUserRoleMutation.reset()
      removeUserRoleMutation.reset()
    } else {
      // Reset form state when modal closes
      setSelectedRoleId(user?.role?.id ?? null)
    }
  }, [isOpen, user])

  const handleSave = async () => {
    if (!user) return

    try {
      if (selectedRoleId === null) {
        await removeUserRoleMutation.mutateAsync({ userId: user.id })
      } else if (selectedRoleId) {
        await assignUserRoleMutation.mutateAsync({
          userId: user.id,
          roleId: selectedRoleId,
        })
      }
      onClose()
    } catch (err) {
      // Error is handled by the mutation hooks
    }
  }

  const isLoading =
    assignUserRoleMutation.isPending || removeUserRoleMutation.isPending
  const error: any =
    assignUserRoleMutation.error || removeUserRoleMutation.error

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Manage User</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="space-y-2">
            <Typography variant="muted" className="text-sm font-bold">
              Personal Information
            </Typography>
            <div className="bg-muted/20 rounded-md space-y-3 w-full">
              <div className="space-y-3">
                <div>
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Name
                  </Typography>
                  <Typography variant="h6" className="font-medium">
                    {user?.first_name || user?.last_name
                      ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                      : 'Unknown User'}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Gender
                  </Typography>
                  <Typography className="text-sm">
                    {user?.gender || '-'}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Email
                  </Typography>
                  <Typography className="text-sm break-all">
                    {user?.email || '-'}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Phone
                  </Typography>
                  <Typography className="text-sm">
                    {formatPhoneNumber(user?.phone_number)}
                  </Typography>
                </div>
              </div>

              {user?.team_member_info && (
                <div className="pt-3 border-t">
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide mb-2 font-bold"
                  >
                    Team Member Information
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography
                        variant="muted"
                        className="text-xs uppercase tracking-wide font-medium"
                      >
                        CHA Role
                      </Typography>
                      <Typography className="text-sm">
                        {user.team_member_info.cha_role?.replace('_', ' ') ||
                          '-'}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        variant="muted"
                        className="text-xs uppercase tracking-wide font-medium"
                      >
                        Status
                      </Typography>
                      <Typography className="text-sm">
                        {user.team_member_info.status || '-'}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <Typography
                  variant="muted"
                  className="text-xs uppercase tracking-wide mb-3 font-bold"
                >
                  Security Settings
                </Typography>
                <div className="space-y-2">
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                    as="label"
                  >
                    User Role
                  </Typography>
                  <Select
                    value={selectedRoleId || 'No role'}
                    onValueChange={(value) =>
                      setSelectedRoleId(value === 'No role' ? null : value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No role">
                        <em>No role</em>
                      </SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : 'Failed to update user role'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedRoleId === (user?.role?.id || null)}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
