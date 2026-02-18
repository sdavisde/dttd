'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  updateUserRoles,
  setRoleMembers,
  type RoleType,
} from '@/services/identity/roles'
import { isErr } from '@/lib/results'
import { formatMemberName } from '@/lib/formatting/member-utils'

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

type UseRoleAssignmentProps = {
  members: AssignableMember[]
}

export function useRoleAssignment({ members }: UseRoleAssignmentProps) {
  const router = useRouter()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<CommunityBoardRole | null>(null)
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Committee selection state
  const [selectedCommitteeMembers, setSelectedCommitteeMembers] = useState<
    string[]
  >([])

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingMember, setPendingMember] = useState<AssignableMember | null>(
    null
  )
  const [pendingHolders, setPendingHolders] = useState<AssignableMember[]>([])

  // Computed: members grouped by role ID
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

  // Computed: filtered members based on search
  const filteredMembers = useMemo(() => {
    const trimmed = search.trim().toLowerCase()
    if (!trimmed) return members
    return members.filter((member) => {
      const fullName = formatMemberName(member).toLowerCase()
      const email = (member.email ?? '').toLowerCase()
      return fullName.includes(trimmed) || email.includes(trimmed)
    })
  }, [members, search])

  // Open dialog for a role
  const openDialog = useCallback(
    (role: CommunityBoardRole) => {
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
    },
    [membersByRoleId]
  )

  const closeDialog = useCallback(() => {
    if (isSaving) return
    setDialogOpen(false)
  }, [isSaving])

  // Committee member toggle
  const toggleCommitteeMember = useCallback(
    (memberId: string) => {
      if (isSaving) return
      setSelectedCommitteeMembers((prev) =>
        prev.includes(memberId)
          ? prev.filter((id) => id !== memberId)
          : [...prev, memberId]
      )
    },
    [isSaving]
  )

  // Save committee members
  const saveCommitteeMembers = useCallback(async () => {
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
  }, [activeRole, selectedCommitteeMembers, router])

  // Confirmation dialog handlers
  const openConfirmation = useCallback(
    (member: AssignableMember, holders: AssignableMember[]) => {
      setPendingMember(member)
      setPendingHolders(holders)
      setConfirmOpen(true)
    },
    []
  )

  const closeConfirmation = useCallback(() => {
    if (isSaving) return
    setConfirmOpen(false)
    setPendingMember(null)
    setPendingHolders([])
  }, [isSaving])

  // Core assignment logic
  const assignRole = useCallback(
    async (member: AssignableMember, otherHolders: AssignableMember[]) => {
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

        // Add the new role to the member's existing roles
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

        const displayName = formatMemberName(member)
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
    },
    [activeRole, closeConfirmation, router]
  )

  // Handle assignment (with confirmation check for INDIVIDUAL roles)
  const handleAssign = useCallback(
    async (member: AssignableMember) => {
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
    },
    [activeRole, membersByRoleId, openConfirmation, assignRole]
  )

  // Confirm pending assignment
  const confirmAssignment = useCallback(async () => {
    if (!pendingMember || !activeRole) return
    await assignRole(pendingMember, pendingHolders)
  }, [pendingMember, activeRole, pendingHolders, assignRole])

  return {
    // State
    membersByRoleId,
    filteredMembers,

    // Dialog props
    dialogProps: {
      open: dialogOpen,
      role: activeRole,
      members,
      filteredMembers,
      search,
      onSearchChangeAction: setSearch,
      isSaving,
      onCloseAction: closeDialog,
      onAssignAction: handleAssign,
      selectedMembers: selectedCommitteeMembers,
      onToggleMemberAction: toggleCommitteeMember,
      onSaveCommitteeAction: saveCommitteeMembers,
    },

    // Confirmation dialog props
    confirmationProps: {
      open: confirmOpen,
      pendingMember,
      currentHolders: pendingHolders,
      isSaving,
      onCancelAction: closeConfirmation,
      onConfirmAction: confirmAssignment,
    },

    // Actions
    openDialog,
  }
}
