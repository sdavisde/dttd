import { useState, useEffect } from 'react'
import { assignUserRole, removeUserRole } from '@/actions/users'
import { getUserServiceHistory } from '@/actions/user-experience'
import { UserServiceHistory } from '@/lib/users/experience'
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
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { ExperienceLevelSection } from './experience-level-section'
import { RectorReadySection } from './rector-ready-section'
import { PreviousExperienceSection } from './previous-experience-section'
import { Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Permission, userHasPermission } from '@/lib/security'
import { isNil } from 'lodash'
import { useSession } from '@/components/auth/session-provider'

interface UserRoleSidebarProps {
  user: User | null
  roles: Array<{ id: string; label: string; permissions: string[] }>
  isOpen: boolean
  onClose: () => void
}

export function UserRoleSidebar({
  user,
  roles,
  isOpen,
  onClose,
}: UserRoleSidebarProps) {
  // currentUser is the user browsing the site. user is the user being edited
  const { user: currentUser } = useSession()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [serviceHistory, setServiceHistory] =
    useState<UserServiceHistory | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const router = useRouter()

  const showSecuritySettings =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.WRITE_USER_ROLES])
  const showExperience =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.READ_USER_EXPERIENCE])

  // Update selected role when user changes
  useEffect(() => {
    setSelectedRoleId(user?.role?.id ?? null)
  }, [user])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setIsLoading(false)

      // Fetch service history
      if (user && showExperience) {
        const fetchHistory = async () => {
          setIsLoadingHistory(true)
          const result = await getUserServiceHistory(user.id)

          if (!isErr(result)) {
            setServiceHistory(result.data)
          } else {
            console.error('Failed to fetch service history:', result.error)
          }
          setIsLoadingHistory(false)
        }

        fetchHistory()
      } else {
        setServiceHistory(null)
      }
    } else {
      // Reset form state when modal closes
      setSelectedRoleId(user?.role?.id ?? null)
      setError(null)
      setServiceHistory(null)
    }
  }, [isOpen, user, showExperience])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      let result
      if (selectedRoleId === null) {
        result = await removeUserRole(user.id)
      } else if (selectedRoleId) {
        result = await assignUserRole(user.id, selectedRoleId)
      }

      if (result && isErr(result)) {
        setError(result.error)
        return
      }

      toast.success('User role updated successfully')
      router.refresh()
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update user role'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage User</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="space-y-2">
            <Typography variant="muted" className="text-sm font-bold">
              Personal Information
            </Typography>
            <div className="bg-muted/20 rounded-md p-4 space-y-3 w-full border">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Name
                  </Typography>
                  <Typography variant="h6" className="font-medium">
                    {(user?.first_name ?? user?.last_name)
                      ? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()
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
                    {user?.gender ?? '-'}
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
                <div className="col-span-2">
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                  >
                    Email
                  </Typography>
                  <Typography className="text-sm break-all">
                    {user?.email ?? '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {showExperience && (
            <div className="space-y-2">
              <Typography variant="muted" className="text-sm font-bold">
                Experience & Qualifications
              </Typography>

              <div className="bg-muted/20 rounded-md p-4 space-y-6 w-full border">
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : serviceHistory ? (
                  <>
                    <ExperienceLevelSection
                      level={serviceHistory.level}
                      totalWeekends={serviceHistory.totalDTTDWeekends}
                    />

                    <Separator className="my-2" />

                    <RectorReadySection status={serviceHistory.rectorReady} />

                    <Separator className="my-2" />

                    <PreviousExperienceSection
                      experience={serviceHistory.experience}
                    />
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Unable to load experience data.
                  </div>
                )}
              </div>
            </div>
          )}

          {showSecuritySettings && (
            <div className="space-y-2">
              <Typography variant="muted" className="text-sm font-bold">
                Security Settings
              </Typography>

              <div className="bg-muted/20 rounded-md p-4 space-y-3 w-full border">
                <div className="space-y-2">
                  <Typography
                    variant="muted"
                    className="text-xs uppercase tracking-wide font-medium"
                    as="label"
                  >
                    User Role
                  </Typography>
                  <Select
                    value={selectedRoleId ?? 'No role'}
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
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="mt-6 mb-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedRoleId === (user?.role?.id ?? null)}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
