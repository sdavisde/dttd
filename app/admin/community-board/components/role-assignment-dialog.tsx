'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatMemberName } from '@/lib/formatting/member-utils'
import type { BoardRole, BoardMember } from '@/services/community/board'
import { UserAvatarWithPreview } from '@/components/user-avatar'

type RoleAssignmentDialogProps = {
  open: boolean
  role: BoardRole | null
  members: BoardMember[]
  filteredMembers: BoardMember[]
  search: string
  onSearchChange: (value: string) => void
  isSaving: boolean
  onClose: () => void
  // For INDIVIDUAL roles
  onAssign: (member: BoardMember) => void
  // For COMMITTEE roles
  selectedMembers: string[]
  onToggleMember: (memberId: string) => void
  onSaveCommittee: () => void
}

export function RoleAssignmentDialog({
  open,
  role,
  filteredMembers,
  search,
  onSearchChange,
  isSaving,
  onClose,
  onAssign,
  selectedMembers,
  onToggleMember,
  onSaveCommittee,
}: RoleAssignmentDialogProps) {
  const isCommittee = role?.type === 'COMMITTEE'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Fixed height capped to the viewport: the dialog never grows or scrolls as a whole, only
          the member list scrolls, and the size doesn't jump while filtering. */}
      <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle className="leading-tight">
            {isCommittee
              ? `Manage ${role?.label ?? 'Committee'} Members`
              : `Assign ${role?.label ?? 'role'}`}
          </DialogTitle>
          <DialogDescription>
            {isCommittee
              ? 'Select members for this committee role.'
              : 'Select a person from the master roster to assign this role.'}
          </DialogDescription>
        </DialogHeader>

        <Input
          className="shrink-0"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain rounded-md border p-1">
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users found
            </p>
          ) : isCommittee ? (
            <CommitteeMemberList
              members={filteredMembers}
              selectedMembers={selectedMembers}
              onToggleMember={onToggleMember}
              isSaving={isSaving}
            />
          ) : (
            <IndividualMemberList
              members={filteredMembers}
              activeRoleId={role?.id ?? ''}
              onAssign={onAssign}
              isSaving={isSaving}
            />
          )}
        </div>

        {isCommittee && (
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSaveCommittee} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Members'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

type CommitteeMemberListProps = {
  members: BoardMember[]
  selectedMembers: string[]
  onToggleMember: (memberId: string) => void
  isSaving: boolean
}

function CommitteeMemberList({
  members,
  selectedMembers,
  onToggleMember,
  isSaving,
}: CommitteeMemberListProps) {
  return (
    <>
      {members.map((member) => {
        const name = formatMemberName(member)
        const roleLabels = member.roles.map((role) => role.label)
        const isSelected = selectedMembers.includes(member.id)

        return (
          <label
            key={member.id}
            className={`flex min-h-11 w-full min-w-0 items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Checkbox
              className="shrink-0"
              checked={isSelected}
              onCheckedChange={() => onToggleMember(member.id)}
            />
            <UserAvatarWithPreview
              user={{
                id: member.id,
                first_name: member.firstName,
                last_name: member.lastName,
                email: member.email,
                phone_number: member.phoneNumber,
                profilePhoto: member.profilePhoto,
              }}
              size={28}
            />
            <MemberInfo
              memberId={member.id}
              name={name}
              email={member.email}
              roleLabels={roleLabels}
            />
          </label>
        )
      })}
    </>
  )
}

type IndividualMemberListProps = {
  members: BoardMember[]
  activeRoleId: string
  onAssign: (member: BoardMember) => void
  isSaving: boolean
}

function IndividualMemberList({
  members,
  activeRoleId,
  onAssign,
  isSaving,
}: IndividualMemberListProps) {
  return (
    <>
      {members.map((member) => {
        const name = formatMemberName(member)
        const roleLabels = member.roles.map((role) => role.label)
        const isAssignedToActive = member.roles.some(
          (role) => role.id === activeRoleId
        )

        return (
          <button
            key={member.id}
            onClick={() => onAssign(member)}
            disabled={isSaving || isAssignedToActive}
            className="flex min-h-11 w-full min-w-0 items-center gap-3 text-left px-3 py-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserAvatarWithPreview
              user={{
                id: member.id,
                first_name: member.firstName,
                last_name: member.lastName,
                email: member.email,
                phone_number: member.phoneNumber,
                profilePhoto: member.profilePhoto,
              }}
              size={28}
            />
            <MemberInfo
              memberId={member.id}
              name={name}
              email={member.email}
              roleLabels={roleLabels}
            />
          </button>
        )
      })}
    </>
  )
}

type MemberInfoProps = {
  memberId: string
  name: string
  email: string | null
  roleLabels: string[]
}

// Badges sit under the name/email rather than beside them so long emails and many roles can't push
// the row wider than the dialog on narrow screens.
function MemberInfo({ memberId, name, email, roleLabels }: MemberInfoProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate font-medium">{name}</div>
      <div className="truncate text-sm text-muted-foreground">
        {email ?? 'No email'}
      </div>
      {roleLabels.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {roleLabels.map((label) => (
            <Badge
              key={`${memberId}-${label}`}
              variant="outline"
              className="max-w-full truncate"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
