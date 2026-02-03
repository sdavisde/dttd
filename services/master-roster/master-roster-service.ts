import 'server-only'

import { isErr, ok, Result, unwrapOr, safeParse, isOk } from '@/lib/results'
import * as MasterRosterRepository from './repository'
import { addressSchema } from '@/lib/users/validation'
import { UserExperienceSchema } from '@/lib/users/experience'
import {
  calculateExperienceLevel,
  calculateRectorReadyStatus,
  countDistinctWeekends,
} from '@/lib/users/experience/calculations'
import { Tables } from '@/database.types'
import {
  MasterRoster,
  MasterRosterMember,
  ExperienceDistribution,
} from './types'
import { countBy } from 'lodash'

export async function getMasterRoster(): Promise<Result<string, MasterRoster>> {
  const result = await MasterRosterRepository.getMasterRoster()
  if (isErr(result)) {
    return result
  }

  const roster = result.data
  const members: Array<MasterRosterMember> = roster.map((member) => {
    const memberAddress =
      unwrapOr(addressSchema.safeParse(member.address), null) ?? null
    const experience = normalizeUserExperience(member.users_experience)
    const distinctWeekends = countDistinctWeekends(experience)
    const level = calculateExperienceLevel(distinctWeekends)
    const rectorReady = calculateRectorReadyStatus(experience)

    return {
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      gender: member.gender,
      email: member.email,
      phoneNumber: member.phone_number,
      address: memberAddress,
      communityInformation: {
        churchAffiliation: member.church_affiliation,
        weekendAttended: member.weekend_attended,
        essentialsTrainingDate: member.essentials_training_date,
        specialGiftsAndSkills: member.special_gifts_and_skills,
      },
      permissions: getPermissionsFromUserRoles(member.user_roles),
      roles: member.user_roles?.map((role) => role.roles) ?? [],
      experience,
      level,
      rectorReady,
    }
  })

  return ok({
    members,
  })
}

function normalizeUserExperience(
  userExperience: Array<Tables<'users_experience'>>
) {
  const experienceResults = userExperience.map((experience_record) =>
    safeParse(experience_record, UserExperienceSchema)
  )
  const results = experienceResults.filter(isOk)
  return results.map((result) => result.data)
}

function getPermissionsFromUserRoles(
  user_roles_records: Array<{ roles: Tables<'roles'> }>
): Array<string> {
  return user_roles_records.flatMap((user_role) => user_role.roles.permissions)
}

/**
 * Calculates the experience level distribution for active members of a weekend roster.
 * Excludes dropped members (status === 'drop').
 */
export async function getWeekendRosterExperienceDistribution(
  weekendId: string
): Promise<Result<string, ExperienceDistribution>> {
  const result =
    await MasterRosterRepository.getWeekendRosterWithExperience(weekendId)
  if (isErr(result)) {
    return result
  }

  // Filter to active members only (exclude dropped)
  const activeMembers = result.data.filter((member) => member.status !== 'drop')

  // Calculate experience level for each active member
  const levels = activeMembers.map((member) => {
    const experienceRecords = member.users?.users_experience ?? []
    const distinctWeekends = countDistinctWeekends(experienceRecords)
    return calculateExperienceLevel(distinctWeekends)
  })

  const levelCounts = countBy(levels)
  const total = activeMembers.length

  // Calculate percentage (handle division by zero)
  const toPercentage = (count: number): number =>
    total === 0 ? 0 : Math.round((count / total) * 100)

  return ok({
    level1: {
      count: levelCounts['1'] ?? 0,
      percentage: toPercentage(levelCounts['1'] ?? 0),
    },
    level2: {
      count: levelCounts['2'] ?? 0,
      percentage: toPercentage(levelCounts['2'] ?? 0),
    },
    level3: {
      count: levelCounts['3'] ?? 0,
      percentage: toPercentage(levelCounts['3'] ?? 0),
    },
    total,
  })
}
