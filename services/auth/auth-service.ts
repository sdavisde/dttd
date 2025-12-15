import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isNil } from 'lodash'
import { err, isErr, ok, Result, unwrapOr } from '@/lib/results'
import * as AuthRepository from './repository'
import { User } from '@/lib/users/types'
import { WeekendStatus } from '@/lib/weekend/types'
import { addressSchema } from '@/lib/users/validation'

/**
 * Private function to fetch and normalize a user by ID into our
 * shared User type.
 */
async function getUserById(userId: string): Promise<Result<string, User>> {
  const userResult = await AuthRepository.getUser(userId)
  if (isErr(userResult)) {
    return userResult
  }
  const user = userResult.data

  if (isNil(user)) {
    return err('User not found')
  }

  if (isNil(user.email)) {
    return err('User email not found')
  }

  const role = user.user_roles?.at(0)?.roles ?? null

  const teamMemberInfo =
    user.weekend_roster?.find((member) => {
      if (isNil(member.weekends)) {
        return false
      }
      return member.weekends.status === WeekendStatus.ACTIVE
    }) ?? null

  const address = unwrapOr(addressSchema.safeParse(user.address), null) ?? null

  return ok({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    gender: user.gender,
    email: user.email,
    phoneNumber: user.phone_number,
    address,
    role,
    communityInformation: {
      churchAffiliation: user.church_affiliation,
      weekendAttended: user.weekend_attended,
      essentialsTrainingDate: user.essentials_training_date,
      specialGiftsAndSkills: user.special_gifts_and_skills,
    },
    teamMemberInfo,
  })
}

/**
 * Gets the logged in user's session using middleware server session,
 * then returns the normalized user information by id.
 */
export async function getLoggedInUser(): Promise<Result<string, User>> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (isNil(authUser)) return err('User not logged in')

  return await getUserById(authUser.id)
}

/**
 * Updates the roles of a user to match those provided
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  return await AuthRepository.updateUserRoles(userId, roleIds)
}
