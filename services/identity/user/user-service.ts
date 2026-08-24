import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isNil, union } from 'lodash'
import z from 'zod'
import { logger } from '@/lib/logger'
import type { Result } from '@/lib/results'
import { err, isErr, ok, Results, unwrapOr } from '@/lib/results'
import * as UserRepository from './repository'
import type { User, UserRoleInfo } from '@/lib/users/types'
import { WeekendStatus } from '@/lib/weekend/types'
import type { Address } from '@/lib/users/validation'
import { addressSchema } from '@/lib/users/validation'
import type { BasicInfo } from '@/components/team-forms/schemas'
import type { RawUser } from './types'
import { getPermissionsForCHARole } from '@/lib/security'
import type {
  TeamMemberInfo,
  CHARole,
  WeekendAssignment,
} from '@/lib/weekend/types'

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

    // IMPORTANT: The roster join returns ALL users' rows for the weekend.
    // Filter to only this user's rows to prevent leaking other users' roles/permissions.
    const weekendAssignments: WeekendAssignment[] = activeWeekends.flatMap(
      (w) =>
        (w.weekend_roster ?? [])
          .filter((r) => r.user_id === rawUser.id && r.status !== 'drop')
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
    profilePhotoPath: rawUser.profile_photo_path,
    profilePhotoUpdatedAt: rawUser.profile_photo_updated_at,
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

export async function updateUserContactInfo(
  userId: string,
  data: Parameters<typeof UserRepository.updateUserContactInfo>[1]
) {
  return await UserRepository.updateUserContactInfo(userId, data)
}

/**
 * The identity Supabase creates for an email + password account. Its presence is what
 * tells us a member has a password to keep signing in with after their address moves.
 */
const PASSWORD_IDENTITY_PROVIDER = 'email'

const EMAIL_TAKEN_MARKERS = [
  'already been registered',
  'email_exists',
  'already exists',
]

/**
 * Turns a raw GoTrue error into something safe to put in front of an admin. The raw
 * text is logged by the caller; only the conflict case is worth naming specifically,
 * since it is the one an admin can actually act on.
 */
function toFriendlyEmailError(rawError: string): string {
  const normalized = rawError.toLowerCase()
  if (EMAIL_TAKEN_MARKERS.some((marker) => normalized.includes(marker))) {
    return 'That email address already belongs to another account.'
  }
  return 'Unable to update the login email. Please try again.'
}

/**
 * Changes the email address a member signs in with.
 *
 * Their password is unaffected -- it lives in a separate column from the email -- so
 * they sign in with the new address and the password they already had.
 *
 * Refuses accounts that authenticate only through a social provider. The admin API
 * leaves auth.identities pointing at the old address, and for those members there is
 * no password to fall back on, so changing the email would strand them rather than
 * move them.
 */
export async function updateUserLoginEmail(
  userId: string,
  requestedEmail: string
): Promise<Result<string, void>> {
  const email = requestedEmail.trim().toLowerCase()

  if (!z.email().safeParse(email).success) {
    return err('Enter a valid email address.')
  }

  const authUserResult = await UserRepository.getAuthUser(userId)
  if (isErr(authUserResult)) {
    logger.error(
      { error: authUserResult.error, userId },
      'Could not load auth account before login email change'
    )
    return err('Could not load this member’s account.')
  }

  const authUser = authUserResult.data

  // Nothing to do, and skipping the write avoids a pointless auth.users revision.
  if (authUser.email?.trim().toLowerCase() === email) {
    return ok(undefined)
  }

  const identities = authUser.identities ?? []
  const hasPasswordIdentity = identities.some(
    (identity) => identity.provider === PASSWORD_IDENTITY_PROVIDER
  )

  if (identities.length > 0 && !hasPasswordIdentity) {
    const providers = identities.map((identity) => identity.provider).join(', ')
    return err(
      `This member signs in with ${providers}, so their email is controlled by that provider and cannot be changed here.`
    )
  }

  const updateResult = await UserRepository.updateAuthEmail(userId, email)
  if (isErr(updateResult)) {
    logger.error(
      { error: updateResult.error, userId },
      'Failed to update login email'
    )
    return err(toFriendlyEmailError(updateResult.error))
  }

  // public.users.email follows via the sync_users trigger on auth.users, inside the
  // same transaction as the write above -- see the 20260824000000 migration.
  return ok(undefined)
}

export async function updateUserAddress(userId: string, address: Address) {
  return await UserRepository.updateUserAddress(userId, address)
}

/** Persists the path of a freshly uploaded avatar and bumps the cache-bust timestamp. */
export async function updateUserProfilePhoto(userId: string, path: string) {
  return await UserRepository.updateProfilePhoto(userId, path)
}

/** Clears the avatar columns, reverting all surfaces to the initials fallback. */
export async function removeUserProfilePhoto(userId: string) {
  return await UserRepository.clearProfilePhoto(userId)
}

export async function deleteUser(userId: string) {
  return await UserRepository.deleteUser(userId)
}

export async function updateUserBasicInfo(userId: string, data: BasicInfo) {
  return await UserRepository.updateUserBasicInfo(userId, data)
}
