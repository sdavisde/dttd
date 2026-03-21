import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isNil, union } from 'lodash'
import type { Result} from '@/lib/results';
import { err, isErr, ok, Results, unwrapOr } from '@/lib/results'
import * as UserRepository from './repository'
import type { User, UserRoleInfo } from '@/lib/users/types'
import { WeekendStatus } from '@/lib/weekend/types'
import type { Address} from '@/lib/users/validation';
import { addressSchema } from '@/lib/users/validation'
import type { BasicInfo } from '@/components/team-forms/schemas'
import type { RawUser } from './types'
import { getPermissionsForCHARole } from '@/lib/security'
import type { TeamMemberInfo , CHARole, WeekendAssignment} from '@/lib/weekend/types'

function normalizeUser(rawUser: RawUser): Result<string, User> {
  if (isNil(rawUser)) {
    return err('User not found')
  }

  if (isNil(rawUser.email)) {
    return err('User email not found')
  }

  const roles: Array<UserRoleInfo> =
    rawUser.user_roles?.map((userRole: RawUser['user_roles'][number]) => ({
      id: userRole.roles.id,
      label: userRole.roles.label,
      permissions: userRole.roles.permissions ?? [],
      type: userRole.roles.type,
    })) ?? []

  // Find the active group membership: a weekend_group_members row where at least one
  // of its weekends has status === ACTIVE.
  const activeGroupMember =
    rawUser.weekend_group_members?.find((member) => {
      const weekends = member.weekend_groups?.weekends ?? []
      return weekends.some((w) => w.status === WeekendStatus.ACTIVE)
    }) ?? null

  let teamMemberInfo: TeamMemberInfo | null = null

  if (!isNil(activeGroupMember)) {
    const activeWeekends = (
      activeGroupMember.weekend_groups?.weekends ?? []
    ).filter((w) => w.status === WeekendStatus.ACTIVE)

    // Exclude dropped roster rows — they are admin-only concern
    const weekendAssignments: WeekendAssignment[] = activeWeekends.flatMap(
      (w) =>
        (w.weekend_roster ?? [])
          .filter((r) => r.status !== 'drop')
          .map((r) => ({
            rosterId: r.id,
            weekendId: r.weekend_id,
            weekendType: w.type,
            chaRole: r.cha_role,
            rollo: r.rollo,
            additionalChaRole: r.additional_cha_role,
          }))
    )

    // Only set teamMemberInfo if the user has at least one active (non-dropped) assignment
    if (weekendAssignments.length > 0) {
      teamMemberInfo = {
        groupMemberId: activeGroupMember.id,
        groupId: activeGroupMember.group_id,
        groupNumber: activeGroupMember.weekend_groups?.number ?? null,
        weekendAssignments,
      }
    }
  }

  const rolePermissions = roles.flatMap((role) => role.permissions)
  // Union CHA role permissions across all weekend assignments
  const chaRolePermissions = (teamMemberInfo?.weekendAssignments ?? []).flatMap(
    (a) => getPermissionsForCHARole(a.chaRole as CHARole | null)
  )
  const allPermissions = union(rolePermissions, chaRolePermissions)
  const permissions = new Set(allPermissions)

  const address =
    unwrapOr(addressSchema.safeParse(rawUser.address), null) ?? null

  return ok({
    id: rawUser.id,
    firstName: rawUser.first_name,
    lastName: rawUser.last_name,
    gender: rawUser.gender?.toLowerCase() ?? null,
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
    originalUser: null,
  })
}

/**
 * Gets the logged in user's session using middleware server session,
 * then returns the normalized user information by id.
 */
export async function getLoggedInUser(
  impersonatingUser: User | null
): Promise<Result<string, User>> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (isNil(authUser)) return err('User not logged in')

  const loggedInUser = await getUserById(authUser.id)
  if (isNil(impersonatingUser)) {
    return loggedInUser
  }

  return Results.map(loggedInUser, (user) => ({
    ...impersonatingUser,
    originalUser: user,
  }))
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

export async function updateUserAddress(userId: string, address: Address) {
  return await UserRepository.updateUserAddress(userId, address)
}

export async function deleteUser(userId: string) {
  return await UserRepository.deleteUser(userId)
}

export async function updateUserBasicInfo(userId: string, data: BasicInfo) {
  return await UserRepository.updateUserBasicInfo(userId, data)
}
