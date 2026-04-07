'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { isNil, isEqual } from 'lodash'
import { toast } from 'sonner'
import { isErr } from '@/lib/results'
import { formatPhoneNumber } from '@/lib/utils'
import { WeekendReference } from '@/lib/weekend/weekend-reference'
import { groupExperienceByCommunity } from '@/lib/users/experience'
import { updateUserRoles } from '@/services/identity/roles'
import {
  updateUserContactInfo,
  updateUserAddress,
  updateUserBasicInfo,
} from '@/services/identity/user'
import {
  upsertUserExperience,
  deleteUserExperience,
} from '@/actions/user-experience'
import type { CHARole } from '@/lib/weekend/types'
import type { Address } from '@/lib/users/validation'
import type { MasterRosterMember } from '@/services/master-roster/types'
import type { UserExperience } from '@/lib/users/experience'
import type {
  ContactFields,
  AddressFields,
  CommunityFields,
  NewExperienceEntry,
} from '../types'

interface UseUserEditFormOptions {
  member: MasterRosterMember | null
  roles: Array<{ id: string; label: string; permissions: string[] }>
  isOpen: boolean
  onClose: () => void
}

export function useUserEditForm({
  member,
  roles,
  isOpen,
  onClose,
}: UseUserEditFormOptions) {
  const router = useRouter()

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [contact, setContact] = useState<ContactFields>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
  })

  const [address, setAddress] = useState<AddressFields>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  })

  const [community, setCommunity] = useState<CommunityFields>({
    churchAffiliation: '',
    weekendCommunity: '',
    weekendNumber: '',
    essentialsDate: undefined,
    skills: [],
  })

  const [newExperience, setNewExperience] = useState<NewExperienceEntry[]>([])
  const [deletedExperienceIds, setDeletedExperienceIds] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')

  const initialRoleIds = member?.roles?.map((r) => r.id) ?? []

  const totalDTTDWeekends = useMemo(() => {
    if (isNil(member?.experience) || member.experience.length === 0) return 0
    const grouped = groupExperienceByCommunity(member.experience)
    return grouped.find((g) => g.community === 'DTTD')?.records.length ?? 0
  }, [member?.experience])

  const visibleExperience: UserExperience[] = (member?.experience ?? []).filter(
    (e) => !deletedExperienceIds.includes(e.id)
  )

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.label,
  }))

  // Initialize all form state when member changes
  useEffect(() => {
    if (isNil(member)) return

    setSelectedRoleIds(member.roles?.map((r) => r.id) ?? [])
    setContact({
      firstName: member.firstName ?? '',
      lastName: member.lastName ?? '',
      phone: formatPhoneNumber(member.phoneNumber) ?? '',
      email: member.email ?? '',
      gender: member.gender ?? '',
    })
    setAddress({
      addressLine1: member.address?.addressLine1 ?? '',
      addressLine2: member.address?.addressLine2 ?? '',
      city: member.address?.city ?? '',
      state: member.address?.state ?? '',
      zip: member.address?.zip ?? '',
    })

    let weekendCommunity = ''
    let weekendNumber = ''
    if (!isNil(member.communityInformation.weekendAttended)) {
      try {
        const ref = WeekendReference.fromString(
          member.communityInformation.weekendAttended
        )
        weekendCommunity = ref.community
        weekendNumber = ref.weekend_number.toString()
      } catch {
        // ignore parse errors
      }
    }

    setCommunity({
      churchAffiliation: member.communityInformation.churchAffiliation ?? '',
      weekendCommunity,
      weekendNumber,
      essentialsDate: !isNil(member.communityInformation.essentialsTrainingDate)
        ? new Date(member.communityInformation.essentialsTrainingDate)
        : undefined,
      skills: member.communityInformation.specialGiftsAndSkills ?? [],
    })

    setNewExperience([])
    setDeletedExperienceIds([])
    setError(null)
  }, [member])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setNewExperience([])
      setDeletedExperienceIds([])
      setCustomSkill('')
    }
  }, [isOpen])

  const toggleSkill = (skill: string) => {
    setCommunity((prev) => {
      const current = new Set(prev.skills)
      if (current.has(skill)) {
        current.delete(skill)
      } else {
        current.add(skill)
      }
      return { ...prev, skills: Array.from(current) }
    })
  }

  const addCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (trimmed !== '') {
      setCommunity((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }))
      setCustomSkill('')
    }
  }

  const handleSave = async () => {
    if (isNil(member)) return

    setIsLoading(true)
    setError(null)

    try {
      // 1. Contact info
      const phoneDigits = contact.phone.replace(/\D/g, '')
      const contactResult = await updateUserContactInfo(member.id, {
        first_name: contact.firstName !== '' ? contact.firstName : null,
        last_name: contact.lastName !== '' ? contact.lastName : null,
        phone_number: phoneDigits !== '' ? phoneDigits : null,
        email: contact.email,
        gender: contact.gender !== '' ? contact.gender : null,
      })
      if (isErr(contactResult)) {
        setError(contactResult.error)
        return
      }

      // 2. Address (only if any field is filled)
      const hasAddress =
        address.addressLine1 !== '' ||
        address.city !== '' ||
        address.state !== '' ||
        address.zip !== ''
      if (hasAddress) {
        const addressResult = await updateUserAddress(member.id, {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          zip: address.zip,
        } as Address)
        if (isErr(addressResult)) {
          setError(addressResult.error)
          return
        }
      }

      // 3. Basic info (church, weekend attended, essentials, skills)
      if (
        community.churchAffiliation !== '' ||
        community.weekendCommunity !== ''
      ) {
        const basicInfoResult = await updateUserBasicInfo(member.id, {
          church_affiliation: community.churchAffiliation,
          weekend_attended: {
            community: community.weekendCommunity,
            weekend_number: community.weekendNumber,
          },
          essentials_training_date: community.essentialsDate,
          special_gifts_and_skills:
            community.skills.length > 0 ? community.skills : undefined,
        })
        if (isErr(basicInfoResult)) {
          setError(basicInfoResult.error)
          return
        }
      }

      // 4. Roles (if changed)
      if (!isEqual(initialRoleIds.sort(), selectedRoleIds.sort())) {
        const rolesResult = await updateUserRoles({
          userId: member.id,
          roleIds: selectedRoleIds,
        })
        if (!isNil(rolesResult) && isErr(rolesResult)) {
          setError(rolesResult.error)
          return
        }
      }

      // 5. Delete removed experience
      for (const id of deletedExperienceIds) {
        const result = await deleteUserExperience(id)
        if (isErr(result)) {
          setError(result.error)
          return
        }
      }

      // 6. Add new experience entries
      for (const entry of newExperience) {
        if (
          entry.cha_role === '' ||
          entry.community === '' ||
          entry.weekend_number === ''
        )
          continue
        const result = await upsertUserExperience(member.id, {
          cha_role: entry.cha_role as CHARole,
          community: entry.community,
          weekend_number: entry.weekend_number,
          rollo: entry.rollo !== '' ? entry.rollo : null,
        })
        if (isErr(result)) {
          setError(result.error)
          return
        }
      }

      toast.success('User updated successfully')
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // State
    contact,
    setContact,
    address,
    setAddress,
    community,
    setCommunity,
    selectedRoleIds,
    setSelectedRoleIds,
    newExperience,
    setNewExperience,
    deletedExperienceIds,
    setDeletedExperienceIds,
    customSkill,
    setCustomSkill,
    isLoading,
    error,
    // Derived
    totalDTTDWeekends,
    visibleExperience,
    roleOptions,
    // Helpers
    toggleSkill,
    addCustomSkill,
    handleSave,
  }
}
