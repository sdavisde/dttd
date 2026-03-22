'use client'

import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePreWeekendEmail } from '@/hooks/use-pre-weekend-email'
import { useRoleAssignment } from '@/hooks/use-role-assignment'
import { RoleCard } from './role-card'
import { PreWeekendRoleCard } from './pre-weekend-role-card'
import { RoleAssignmentDialog } from './role-assignment-dialog'
import { AssignmentConfirmationDialog } from './assignment-confirmation-dialog'
import type { BoardRole, BoardMember } from '@/services/community/board'
import type { ContactInfo } from '@/services/notifications'

type RoleAssignmentsProps = {
  boardRoles: BoardRole[]
  committeeRoles: BoardRole[]
  members: BoardMember[]
  preWeekendCoupleContact: ContactInfo
}

export function RoleAssignments({
  boardRoles,
  committeeRoles,
  members,
  preWeekendCoupleContact,
}: RoleAssignmentsProps) {
  const preWeekendEmail = usePreWeekendEmail({
    contact: preWeekendCoupleContact,
  })
  const roleAssignment = useRoleAssignment({ members })

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Board Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {boardRoles.map((role) =>
                role.label === 'Pre Weekend Couple' ? (
                  <PreWeekendRoleCard
                    key={role.id}
                    role={role}
                    assignedMembers={
                      roleAssignment.membersByRoleId[role.id] ?? []
                    }
                    onAssignClick={() => roleAssignment.openDialog(role)}
                    {...preWeekendEmail}
                  />
                ) : (
                  <RoleCard
                    key={role.id}
                    role={role}
                    assignedMembers={
                      roleAssignment.membersByRoleId[role.id] ?? []
                    }
                    onAssignClick={() => roleAssignment.openDialog(role)}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {committeeRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              assignedMembers={roleAssignment.membersByRoleId[role.id] ?? []}
              onAssignClick={() => roleAssignment.openDialog(role)}
            />
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Group Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Placeholder for group photo
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RoleAssignmentDialog {...roleAssignment.dialogProps} />
      <AssignmentConfirmationDialog {...roleAssignment.confirmationProps} />
    </>
  )
}
