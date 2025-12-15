import 'server-only'

import { isErr, ok, Result, unwrapOr, safeParse, isOk } from '@/lib/results'
import * as MasterRosterRepository from './repository'
import { addressSchema } from '@/lib/users/validation'
import { UserExperienceSchema } from '@/lib/users/experience'
import { Tables } from '@/database.types'
import { MasterRoster, MasterRosterMember } from './types'

export async function getMasterRoster(): Promise<Result<string, MasterRoster>> {
  const result = await MasterRosterRepository.getMasterRoster()
  if (isErr(result)) {
    return result
  }

  const roster = result.data
  const members: Array<MasterRosterMember> = roster.map((member) => {
    const memberAddress =
      unwrapOr(addressSchema.safeParse(member.address), null) ?? null
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
      experience: normalizeUserExperience(member.users_experience),
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
