'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, ClipboardList, Users, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Typography } from '@/components/ui/typography'
import {
  updateUserRoles,
  setRoleMembers,
  type RoleType,
} from '@/services/identity/roles'
import { updateContactInformation } from '@/services/notifications'
import { isErr } from '@/lib/results'
import { Tables } from '@/database.types'
import { Checkbox } from '@/components/ui/checkbox'

export type CommunityBoardRole = {
  id: string
  label: string
  type: RoleType
  description: string | null
}

export type AssignableMember = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  roles: Array<{ id: string; label: string }>
}

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
  const router = useRouter()
  const [preWeekendEmail, setPreWeekendEmail] = useState(
    preWeekendCoupleContact.email_address ?? ''
  )
  const [isEditingPreWeekend, setIsEditingPreWeekend] = useState(false)
  const [isSavingPreWeekend, setIsSavingPreWeekend] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<CommunityBoardRole | null>(null)
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingMember, setPendingMember] = useState<AssignableMember | null>(
    null
  )
  const [pendingHolders, setPendingHolders] = useState<AssignableMember[]>([])
  const [selectedCommitteeMembers, setSelectedCommitteeMembers] = useState<
    string[]
  >([])

  const membersByRoleId = useMemo(() => {
    return members.reduce<Record<string, AssignableMember[]>>((acc, member) => {
      member.roles.forEach((role) => {
        if (!acc[role.id]) {
          acc[role.id] = []
        }
        acc[role.id].push(member)
      })
      return acc
    }, {})
  }, [members])

  const filteredMembers = useMemo(() => {
    const trimmed = search.trim().toLowerCase()
    if (!trimmed) return members
    return members.filter((member) => {
      const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`
        .trim()
        .toLowerCase()
      const email = (member.email ?? '').toLowerCase()
      return fullName.includes(trimmed) || email.includes(trimmed)
    })
  }, [members, search])

  const openDialog = (role: CommunityBoardRole) => {
    setActiveRole(role)
    setSearch('')
    // For committee roles, initialize with current members
    if (role.type === 'COMMITTEE') {
      const currentMembers = membersByRoleId[role.id] ?? []
      setSelectedCommitteeMembers(currentMembers.map((m) => m.id))
    } else {
      setSelectedCommitteeMembers([])
    }
    setDialogOpen(true)
  }

  const openConfirmation = (
    member: AssignableMember,
    holders: AssignableMember[]
  ) => {
    setPendingMember(member)
    setPendingHolders(holders)
    setConfirmOpen(true)
  }

  const closeConfirmation = () => {
    if (isSaving) return
    setConfirmOpen(false)
    setPendingMember(null)
    setPendingHolders([])
  }

  const handleSavePreWeekendEmail = async () => {
    if (!preWeekendEmail.trim()) {
      toast.error('Email address cannot be empty')
      return
    }

    setIsSavingPreWeekend(true)
    try {
      const result = await updateContactInformation({
        contactId: 'preweekend-couple',
        emailAddress: preWeekendEmail.trim(),
      })

      if (result && isErr(result)) {
        toast.error(result.error)
        return
      }

      toast.success('Pre-Weekend Couple email updated successfully')
      setIsEditingPreWeekend(false)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update email'
      toast.error(message)
    } finally {
      setIsSavingPreWeekend(false)
    }
  }

  const handleCancelPreWeekendEmail = () => {
    setPreWeekendEmail(preWeekendCoupleContact.email_address ?? '')
    setIsEditingPreWeekend(false)
  }

  const handleSaveCommitteeMembers = async () => {
    if (!activeRole) return

    setIsSaving(true)
    try {
      const result = await setRoleMembers({
        roleId: activeRole.id,
        userIds: selectedCommitteeMembers,
      })

      if (result && isErr(result)) {
        toast.error(result.error)
        return
      }

      toast.success(`${activeRole.label} members updated successfully.`)
      setDialogOpen(false)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update members'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const assignRole = async (
    member: AssignableMember,
    otherHolders: AssignableMember[]
  ) => {
    if (!activeRole) return

    const alreadyAssigned = member.roles.some(
      (role) => role.id === activeRole.id
    )
    if (alreadyAssigned) return

    const isCommitteeRole = activeRole.type === 'COMMITTEE'

    setIsSaving(true)
    try {
      // For INDIVIDUAL roles, remove the role from other holders first
      if (!isCommitteeRole && otherHolders.length > 0) {
        await Promise.all(
          otherHolders.map(async (holder) => {
            const updatedRoleIds = holder.roles
              .map((role) => role.id)
              .filter((roleId) => roleId !== activeRole.id)
            const result = await updateUserRoles({
              userId: holder.id,
              roleIds: updatedRoleIds,
            })
            if (result && isErr(result)) {
              throw new Error(result.error)
            }
          })
        )
      }

      // Add the new role to the member's existing roles (users can hold multiple roles)
      const existingRoleIds = member.roles.map((role) => role.id)
      const newRoleIds = [...existingRoleIds, activeRole.id]

      const result = await updateUserRoles({
        userId: member.id,
        roleIds: newRoleIds,
      })

      if (result && isErr(result)) {
        toast.error(result.error)
        return
      }

      const displayName =
        `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || 'User'
      toast.success(`${displayName} assigned to ${activeRole.label}.`)
      setDialogOpen(false)
      closeConfirmation()
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to assign role'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssign = async (member: AssignableMember) => {
    if (!activeRole) return

    const alreadyAssigned = member.roles.some(
      (role) => role.id === activeRole.id
    )
    if (alreadyAssigned) return

    const currentRoleHolders = membersByRoleId[activeRole.id] ?? []
    const otherHolders = currentRoleHolders.filter(
      (holder) => holder.id !== member.id
    )
    const isCommitteeRole = activeRole.type === 'COMMITTEE'

    // For INDIVIDUAL roles, show confirmation if someone else already holds this role
    const needsConfirmation = !isCommitteeRole && otherHolders.length > 0

    if (needsConfirmation) {
      openConfirmation(member, otherHolders)
      return
    }

    await assignRole(member, otherHolders)
  }

  const renderRoleCard = (role: CommunityBoardRole) => {
    const description = role.description ?? 'Role description coming soon.'

    // Special handling for Pre-Weekend Couple - editable email instead of user assignment
    if (role.label === 'Pre Weekend Couple') {
      return (
        <Card key={role.id} className="border-muted">
          <CardContent className="space-y-3 pt-6">
            <div>
              <Typography variant="h5">{role.label}</Typography>
              <Typography variant="muted">{description}</Typography>
            </div>
            <div className="space-y-2">
              <label htmlFor="preweekend-email" className="text-sm font-medium">
                Contact Email
              </label>
              {isEditingPreWeekend ? (
                <div className="flex gap-2">
                  <Input
                    id="preweekend-email"
                    type="email"
                    value={preWeekendEmail}
                    onChange={(e) => setPreWeekendEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={isSavingPreWeekend}
                  />
                  <Button
                    size="sm"
                    onClick={handleSavePreWeekendEmail}
                    disabled={isSavingPreWeekend}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelPreWeekendEmail}
                    disabled={isSavingPreWeekend}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border px-3 py-2 text-sm">
                    {preWeekendEmail || 'No email set'}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingPreWeekend(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Standard role card with user assignment
    const assignedMembers = membersByRoleId[role.id] ?? []
    const hasAssignments = assignedMembers.length > 0

    return (
      <Card key={role.id} className="border-muted">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Typography variant="h5">{role.label}</Typography>
              <Typography variant="muted">{description}</Typography>
            </div>
            <div className="flex flex-col items-end gap-2">
              {hasAssignments ? (
                <div className="flex flex-wrap gap-2 justify-end">
                  {assignedMembers.map((member) => (
                    <Badge key={member.id} variant="secondary">
                      {member.firstName} {member.lastName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge color="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Unassigned
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDialog(role)}
              >
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
              {boardRoles.map(renderRoleCard)}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leaders Committee
              </CardTitle>
              <Typography variant="muted">
                {leadersCommitteeRole?.description ??
                  'Committee assignments for board leadership.'}
              </Typography>
            </CardHeader>
            <CardContent className="space-y-2">
              {leadersCommitteeRole ? (
                (membersByRoleId[leadersCommitteeRole.id] ?? []).length > 0 ? (
                  membersByRoleId[leadersCommitteeRole.id].map((member) => (
                    <div
                      key={member.id}
                      className="rounded-md border px-3 py-2 text-sm font-medium"
                    >
                      {member.firstName} {member.lastName}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    No committee members assigned.
                  </div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  Leaders Committee role not configured.
                </div>
              )}
              {leadersCommitteeRole && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => openDialog(leadersCommitteeRole)}
                >
                  Edit Committee Members
                </Button>
              )}
            </CardContent>
          </Card>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {activeRole?.type === 'COMMITTEE'
                ? `Manage ${activeRole?.label ?? 'Committee'} Members`
                : `Assign ${activeRole?.label ?? 'role'}`}
            </DialogTitle>
            <DialogDescription>
              {activeRole?.type === 'COMMITTEE'
                ? 'Select members for this committee role.'
                : 'Select a person from the master roster to assign this role.'}
            </DialogDescription>
          </DialogHeader>

          {activeRole?.type === 'COMMITTEE' ? (
            <div className="space-y-4">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                ) : (
                  filteredMembers.map((member) => {
                    const name =
                      `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
                    const roleLabels = member.roles.map((role) => role.label)
                    const isSelected = selectedCommitteeMembers.includes(
                      member.id
                    )

                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (isSaving) return
                            if (checked) {
                              setSelectedCommitteeMembers([
                                ...selectedCommitteeMembers,
                                member.id,
                              ])
                            } else {
                              setSelectedCommitteeMembers(
                                selectedCommitteeMembers.filter(
                                  (id) => id !== member.id
                                )
                              )
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email ?? 'No email'}
                          </div>
                        </div>
                        {roleLabels.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1">
                            {roleLabels.map((label) => (
                              <Badge
                                key={`${member.id}-${label}`}
                                variant="outline"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    )
                  })
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCommitteeMembers}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Members'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                ) : (
                  filteredMembers.map((member) => {
                    const name =
                      `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
                    const roleLabels = member.roles.map((role) => role.label)
                    const isAssignedToActive = Boolean(
                      activeRole &&
                        member.roles.some((role) => role.id === activeRole.id)
                    )

                    return (
                      <button
                        key={member.id}
                        onClick={() => handleAssign(member)}
                        disabled={isSaving || isAssignedToActive}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">
                              {name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email ?? 'No email'}
                            </div>
                          </div>
                          {roleLabels.length > 0 && (
                            <div className="flex flex-wrap justify-end gap-1">
                              {roleLabels.map((label) => (
                                <Badge
                                  key={`${member.id}-${label}`}
                                  variant="outline"
                                >
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirmation()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm assignment</DialogTitle>
            <DialogDescription>
              This will update role assignments for the community board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            {pendingHolders.length > 0 && (
              <div>
                <span className="text-foreground font-medium">
                  Replacing current holder(s):
                </span>{' '}
                {pendingHolders
                  .map((holder) =>
                    `${holder.firstName ?? ''} ${holder.lastName ?? ''}`.trim()
                  )
                  .filter(Boolean)
                  .join(', ') || 'Unknown user'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeConfirmation}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!pendingMember || !activeRole) return
                await assignRole(pendingMember, pendingHolders)
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
