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
import type {
  CommunityBoardRole,
  AssignableMember,
} from '@/hooks/use-role-assignment'

type RoleAssignmentDialogProps = {
  open: boolean
  role: CommunityBoardRole | null
  members: AssignableMember[]
  filteredMembers: AssignableMember[]
  search: string
  onSearchChange: (value: string) => void
  isSaving: boolean
  onClose: () => void
  // For INDIVIDUAL roles
  onAssign: (member: AssignableMember) => void
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
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

        <div className="space-y-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="max-h-72 overflow-y-auto space-y-1">
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
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={onSaveCommittee} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Members'}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type CommitteeMemberListProps = {
  members: AssignableMember[]
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
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleMember(member.id)}
            />
            <MemberInfo name={name} email={member.email} />
            <RoleBadges memberId={member.id} roleLabels={roleLabels} />
          </label>
        )
      })}
    </>
  )
}

type IndividualMemberListProps = {
  members: AssignableMember[]
  activeRoleId: string
  onAssign: (member: AssignableMember) => void
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
            className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between gap-3">
              <MemberInfo name={name} email={member.email} />
              <RoleBadges memberId={member.id} roleLabels={roleLabels} />
            </div>
          </button>
        )
      })}
    </>
  )
}

type MemberInfoProps = {
  name: string
  email: string | null
}

function MemberInfo({ name, email }: MemberInfoProps) {
  return (
    <div className="flex-1">
      <div className="font-medium">{name}</div>
      <div className="text-sm text-muted-foreground">{email ?? 'No email'}</div>
    </div>
  )
}

type RoleBadgesProps = {
  memberId: string
  roleLabels: string[]
}

function RoleBadges({ memberId, roleLabels }: RoleBadgesProps) {
  if (roleLabels.length === 0) return null

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {roleLabels.map((label) => (
        <Badge key={`${memberId}-${label}`} variant="outline">
          {label}
        </Badge>
      ))}
    </div>
  )
}
