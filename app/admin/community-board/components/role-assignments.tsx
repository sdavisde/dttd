'use client'

import { useMemo } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePreWeekendEmail } from '@/hooks/use-pre-weekend-email'
import { useRoleAssignment } from '@/hooks/use-role-assignment'
import { RoleAssignmentDialog } from './role-assignment-dialog'
import { AssignmentConfirmationDialog } from './assignment-confirmation-dialog'
import type { BoardRole, BoardMember } from '@/services/community/board'
import type { ContactInfo } from '@/services/notifications'
import { UserAvatarWithPreview } from '@/components/user-avatar'

type RoleAssignmentsProps = {
  boardRoles: BoardRole[]
  committeeRoles: BoardRole[]
  members: BoardMember[]
  preWeekendCoupleContact: ContactInfo
  /** Rendered in the right column beneath the committees card (meeting minutes). */
  children?: React.ReactNode
}

function MemberAvatars({ assigned }: { assigned: BoardMember[] }) {
  return (
    <div className="flex items-center">
      {assigned.map((member, index) => (
        <div
          key={member.id}
          className={index > 0 ? '-ml-2 rounded-full ring-2 ring-card' : ''}
        >
          <UserAvatarWithPreview
            user={{
              id: member.id,
              first_name: member.firstName,
              last_name: member.lastName,
              email: member.email,
              profilePhoto: member.profilePhoto,
            }}
            size={32}
            previewSize={96}
          />
        </div>
      ))}
    </div>
  )
}

function PositionRow({
  role,
  assigned,
  canEdit,
  onAssignClick,
  subtitle,
  detail,
}: {
  role: BoardRole
  assigned: BoardMember[]
  canEdit: boolean
  onAssignClick: () => void
  subtitle?: string
  detail?: React.ReactNode
}) {
  const hasAssignments = assigned.length > 0
  const names = assigned
    .map((member) => `${member.firstName} ${member.lastName}`)
    .join(', ')

  return (
    <div className="flex items-center gap-3.5 border-b border-divider py-3 last:border-b-0">
      <div
        className="w-40 shrink-0 sm:w-52"
        title={role.description ?? undefined}
      >
        <div className="text-sm font-semibold">{role.label}</div>
        {subtitle !== undefined && (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {hasAssignments ? (
        <div className="flex min-w-0 items-center gap-2.5">
          <MemberAvatars assigned={assigned} />
          <div className="min-w-0">
            <div className="truncate text-sm">{names}</div>
            {detail}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="rounded-full border border-secondary-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            Open
          </span>
          <span className="truncate text-sm text-muted-foreground">
            No one holds this yet
          </span>
        </div>
      )}
      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAssignClick}
          className="ml-auto shrink-0"
        >
          {hasAssignments ? 'Change' : 'Assign'}
        </Button>
      )}
    </div>
  )
}

export function RoleAssignments({
  boardRoles,
  committeeRoles,
  members,
  preWeekendCoupleContact,
  children,
}: RoleAssignmentsProps) {
  const preWeekendEmail = usePreWeekendEmail({
    contact: preWeekendCoupleContact,
  })
  const roleAssignment = useRoleAssignment({ members })

  const openCount = useMemo(
    () =>
      boardRoles.filter(
        (role) => (roleAssignment.membersByRoleId[role.id] ?? []).length === 0
      ).length,
    [boardRoles, roleAssignment.membersByRoleId]
  )

  const preWeekendDetail = preWeekendEmail.isEditingEmail ? (
    <div className="mt-1 flex items-center gap-1.5">
      <Input
        id="preweekend-email"
        type="email"
        value={preWeekendEmail.email}
        onChange={(e) => preWeekendEmail.setEmail(e.target.value)}
        placeholder="email@example.com"
        disabled={preWeekendEmail.isSavingEmail}
        className="h-8 text-xs"
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={preWeekendEmail.saveEmail}
        disabled={preWeekendEmail.isSavingEmail}
      >
        <Check className="h-3.5 w-3.5" />
        <span className="sr-only">Save email</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={preWeekendEmail.cancelEditEmail}
        disabled={preWeekendEmail.isSavingEmail}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Cancel</span>
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <span className="truncate text-xs text-muted-foreground">
        {preWeekendEmail.email !== ''
          ? preWeekendEmail.email
          : 'No notification email set'}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 shrink-0 p-0"
        onClick={preWeekendEmail.startEditEmail}
      >
        <Pencil className="h-3 w-3" />
        <span className="sr-only">Edit notification email</span>
      </Button>
    </div>
  )

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <div className="flex items-baseline justify-between pb-1">
              <h2 className="font-serif text-lg font-semibold tracking-tight">
                Board positions
              </h2>
              <span className="text-[13px] text-muted-foreground">
                {boardRoles.length} positions
                {openCount > 0 && ` · ${openCount} open`}
              </span>
            </div>
            {boardRoles.map((role) => (
              <PositionRow
                key={role.id}
                role={role}
                assigned={roleAssignment.membersByRoleId[role.id] ?? []}
                canEdit
                onAssignClick={() => roleAssignment.openDialog(role)}
                subtitle={
                  role.label === 'Pre Weekend Couple'
                    ? 'Gets sponsorship notifications'
                    : undefined
                }
                detail={
                  role.label === 'Pre Weekend Couple'
                    ? preWeekendDetail
                    : undefined
                }
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {committeeRoles.length > 0 && (
            <Card className="gap-0 py-0">
              <CardContent className="px-5 py-4">
                <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
                  Committees &amp; teams
                </h2>
                {committeeRoles.map((role) => (
                  <PositionRow
                    key={role.id}
                    role={role}
                    assigned={roleAssignment.membersByRoleId[role.id] ?? []}
                    canEdit
                    onAssignClick={() => roleAssignment.openDialog(role)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
          {children}
        </div>
      </div>

      <RoleAssignmentDialog {...roleAssignment.dialogProps} />
      <AssignmentConfirmationDialog {...roleAssignment.confirmationProps} />
    </>
  )
}
