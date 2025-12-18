import { useState, useEffect, useMemo } from 'react'
import { groupExperienceByCommunity } from '@/lib/users/experience'
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
import { MultiSelect } from '@/components/ui/multi-select'
import { formatPhoneNumber } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isErr } from '@/lib/results'
import { ExperienceLevelSection } from './experience-level-section'
import { RectorReadySection } from './rector-ready-section'
import { PreviousExperienceSection } from './previous-experience-section'
import { Separator } from '@/components/ui/separator'
import { Permission, userHasPermission } from '@/lib/security'
import { isNil, isEqual } from 'lodash'
import { useSession } from '@/components/auth/session-provider'
import { MasterRosterMember } from '@/services/master-roster/types'
import { updateUserRoles } from '@/services/identity/roles'

interface UserRoleSidebarProps {
  member: MasterRosterMember | null
  roles: Array<{ id: string; label: string; permissions: string[] }>
  isOpen: boolean
  onClose: () => void
}

export function UserRoleSidebar({
  member,
  roles,
  isOpen,
  onClose,
}: UserRoleSidebarProps) {
  // currentUser is the user browsing the site. user is the user being edited
  const { user: currentUser } = useSession()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // Calculate total DTTD weekends from member experience
  const totalDTTDWeekends = useMemo(() => {
    if (!member?.experience?.length) return 0
    const grouped = groupExperienceByCommunity(member.experience)
    return grouped.find((g) => g.community === 'DTTD')?.records.length ?? 0
  }, [member?.experience])

  const showSecuritySettings =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.WRITE_USER_ROLES])
  const showExperience =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.READ_USER_EXPERIENCE])

  const initialRoleIds = member?.roles?.map((r) => r.id) ?? []

  // Update selected roles when user changes
  useEffect(() => {
    setSelectedRoleIds(member?.roles?.map((r) => r.id) ?? [])
  }, [member])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setIsLoading(false)
    } else {
      // Reset form state when modal closes
      setSelectedRoleIds(member?.roles?.map((r) => r.id) ?? [])
      setError(null)
    }
  }, [isOpen, member])

  const handleSave = async () => {
    if (isNil(member)) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateUserRoles({
        userId: member.id,
        roleIds: selectedRoleIds,
      })

      if (result && isErr(result)) {
        setError(result.error)
        return
      }

      toast.success('User roles updated successfully')
      router.refresh()
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update user roles'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.label,
  }))

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
                    {(member?.firstName ?? member?.lastName)
                      ? `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim()
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
                    {member?.gender ?? '-'}
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
                    {formatPhoneNumber(member?.phoneNumber)}
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
                    {member?.email ?? '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {showExperience && member && (
            <div className="space-y-2">
              <Typography variant="muted" className="text-sm font-bold">
                Experience & Qualifications
              </Typography>

              <div className="bg-muted/20 rounded-md p-4 space-y-6 w-full border">
                <ExperienceLevelSection
                  level={member.level}
                  numDTTDWeekends={totalDTTDWeekends}
                />

                <Separator className="my-2" />

                <RectorReadySection status={member.rectorReady} />

                <Separator className="my-2" />

                <PreviousExperienceSection experience={member.experience} />
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
                    User Roles
                  </Typography>
                  <MultiSelect
                    options={roleOptions}
                    onValueChange={setSelectedRoleIds}
                    defaultValue={selectedRoleIds}
                    placeholder="Select roles"
                    disabled={isLoading}
                  />
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
            disabled={
              isLoading ||
              isEqual(initialRoleIds.sort(), selectedRoleIds.sort())
            }
          >
            {isLoading ? 'Updating...' : 'Update Roles'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
