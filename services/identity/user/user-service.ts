import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isNil } from 'lodash'
import { err, isErr, ok, Result, unwrapOr } from '@/lib/results'
import * as UserRepository from './repository'
import { User, UserRoleInfo } from '@/lib/users/types'
import { WeekendStatus } from '@/lib/weekend/types'
import { Address, addressSchema } from '@/lib/users/validation'
import { BasicInfo } from '@/components/team-forms/schemas'
import { RawUser } from './types'

function normalizeUser(rawUser: RawUser): Result<string, User> {
  if (isNil(rawUser)) {
    return err('User not found')
  }

  if (isNil(rawUser.email)) {
    return err('User email not found')
  }

  const roles: Array<UserRoleInfo> =
    rawUser.user_roles?.map(({ roles }) => ({
      id: roles.id,
      label: roles.label,
      permissions: roles.permissions ?? [],
    })) ?? []

  const allPermissions = roles.flatMap((role) => role.permissions)
  const permissions = new Set(allPermissions)

  const teamMemberInfo =
    rawUser.weekend_roster?.find((member: any) => {
      if (isNil(member.weekends)) {
        return false
      }
      return member.weekends.status === WeekendStatus.ACTIVE
    }) ?? null

  const address =
    unwrapOr(addressSchema.safeParse(rawUser.address), null) ?? null

  return ok({
    id: rawUser.id,
    firstName: rawUser.first_name,
    lastName: rawUser.last_name,
    gender: rawUser.gender,
    email: rawUser.email,
    phoneNumber: rawUser.phone_number,
    address,
    roles,
    permissions,
    communityInformation: {
      churchAffiliation: rawUser.church_affiliation,
      weekendAttended: rawUser.weekend_attended,
      essentialsTrainingDate: rawUser.essentials_training_date,
      specialGiftsAndSkills: rawUser.special_gifts_and_skills,
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

export async function getUserById(
  userId: string
): Promise<Result<string, User>> {
  const userResult = await UserRepository.getUser(userId)
  if (isErr(userResult)) {
    return userResult
  }
  return normalizeUser(userResult.data)
}

export async function getUsers(): Promise<Result<string, Array<User>>> {
  const result = await UserRepository.getAllUsers()
  if (isErr(result)) {
    return result
  }

  const users = result.data
    .map((u) => unwrapOr(normalizeUser(u), null))
    .filter((u) => !isNil(u))

  return ok(users)
}

/**
 * Updates the roles of a user to match those provided
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  return await UserRepository.updateUserRoles(userId, roleIds)
}

export async function updateUserAddress(userId: string, address: Address) {
  return await UserRepository.updateUserAddress(userId, address)
}

export async function deleteUser(userId: string) {
  return await UserRepository.deleteUser(userId)
}

export async function removeUserRole(userId: string) {
  return await UserRepository.removeUserRole(userId)
}

export async function updateUserBasicInfo(userId: string, data: BasicInfo) {
  return await UserRepository.updateUserBasicInfo(userId, data)
}
