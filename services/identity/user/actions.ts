'use server'

import type { Address } from '@/lib/users/validation'
import type { BasicInfo } from '@/components/team-forms/schemas'
import * as UserService from './user-service'
import * as CurrentUser from './current-user'
import {
  authorizedAction,
  authorizedSelfOrPermissionAction,
} from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'

type UpdateUserContactInfoRequest = {
  userId: string
  data: {
    first_name: string | null
    last_name: string | null
    phone_number: string | null
    gender: string | null
  }
}
export const updateUserContactInfo = authorizedSelfOrPermissionAction<
  UpdateUserContactInfoRequest,
  null
>(Permission.FULL_ACCESS, async ({ userId, data }) => {
  return await UserService.updateUserContactInfo(userId, data)
})

type UpdateUserLoginEmailRequest = {
  userId: string
  email: string
}
/**
 * Changes the address a member signs in with, in both auth.users and their profile.
 *
 * Gated on FULL_ACCESS rather than a softer permission because whoever can repoint a
 * login email can also trigger a password reset to the new address, which makes this
 * equivalent to taking over the account.
 */
export const updateUserLoginEmail = authorizedAction<
  UpdateUserLoginEmailRequest,
  void
>(Permission.FULL_ACCESS, async ({ userId, email }) => {
  return await UserService.updateUserLoginEmail(userId, email)
})

type UpdateUserAddressRequest = {
  userId: string
  address: Address
}
/**
 * Self-or-admin: a team member fills in their own address on the team info sheet, and
 * the master roster edits the same field on anyone's behalf.
 */
export const updateUserAddress = authorizedSelfOrPermissionAction<
  UpdateUserAddressRequest,
  null
>(Permission.FULL_ACCESS, async ({ userId, address }) => {
  return await UserService.updateUserAddress(userId, address)
})

export const deleteUser = authorizedAction<string, null>(
  Permission.FULL_ACCESS,
  async (userId) => {
    return await UserService.deleteUser(userId)
  }
)

type UpdateUserBasicInfoRequest = {
  userId: string
  data: BasicInfo
}
/** Self-or-admin for the same reason as {@link updateUserAddress}. */
export const updateUserBasicInfo = authorizedSelfOrPermissionAction<
  UpdateUserBasicInfoRequest,
  null
>(Permission.FULL_ACCESS, async ({ userId, data }) => {
  return await UserService.updateUserBasicInfo(userId, data)
})

/**
 * Left unguarded on purpose: both callers are self-service. Registration writes the
 * avatar moments after sign-up, before any role exists to check, and the profile page
 * lets a member manage their own photo.
 */
export const updateUserProfilePhoto = async (userId: string, path: string) => {
  return await UserService.updateUserProfilePhoto(userId, path)
}

export const removeUserProfilePhoto = async (userId: string) => {
  return await UserService.removeUserProfilePhoto(userId)
}

/**
 * This is required to run `authorizedAction`, so it cannot be wrapped in it. The
 * implementation lives in `current-user.ts` so that `authorizedAction` can reach it
 * without importing this module -- see the note there.
 */
export const getLoggedInUser = async () => {
  return await CurrentUser.getLoggedInUser()
}
