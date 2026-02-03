'use client'

import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Tables } from '@/database.types'
import { usePreWeekendEmail } from '@/hooks/use-pre-weekend-email'
import {
  useRoleAssignment,
  type CommunityBoardRole,
  type AssignableMember,
} from '@/hooks/use-role-assignment'
import { RoleCard } from './role-card'
import { PreWeekendRoleCard } from './pre-weekend-role-card'
import { LeadersCommitteeSection } from './leaders-committee-section'
import { RoleAssignmentDialog } from './role-assignment-dialog'
import { AssignmentConfirmationDialog } from './assignment-confirmation-dialog'

// Re-export types for external use
export type { CommunityBoardRole, AssignableMember }

type RoleAssignmentsProps = {
  boardRoles: CommunityBoardRole[]
  leadersCommitteeRole: CommunityBoardRole | null
  members: AssignableMember[]
  preWeekendCoupleContact: Tables<'contact_information'>
}

export function RoleAssignments({
  boardRoles,
  leadersCommitteeRole,
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
            <Typography variant="muted">
              Read-only view for all admins. Assignment actions appear when
              WRITE_BOARD_POSITIONS is enabled.
            </Typography>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {boardRoles.map((role) =>
                role.label === 'Pre Weekend Couple' ? (
                  <PreWeekendRoleCard
                    key={role.id}
                    role={role}
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
          <LeadersCommitteeSection
            role={leadersCommitteeRole}
            members={
              roleAssignment.membersByRoleId[leadersCommitteeRole?.id ?? ''] ??
              []
            }
            onEditClick={() =>
              leadersCommitteeRole &&
              roleAssignment.openDialog(leadersCommitteeRole)
            }
          />

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
