'use server'

import { Address } from '@/lib/users/validation'
import { BasicInfo } from '@/components/team-forms/schemas'
import * as UserService from './user-service'
import { findImpersonatingUser } from '@/services/identity/impersonation/impersonation-service'

export const updateUserAddress = async (userId: string, address: Address) => {
  return await UserService.updateUserAddress(userId, address)
}

export const deleteUser = async (userId: string) => {
  return await UserService.deleteUser(userId)
}

export const updateUserBasicInfo = async (userId: string, data: BasicInfo) => {
  return await UserService.updateUserBasicInfo(userId, data)
}

/** This is required to run `authorizedAction`, so it cannot be wrapped in it. */
export const getLoggedInUser = async () => {
  const impersonatingUser = await findImpersonatingUser()
  return await UserService.getLoggedInUser(impersonatingUser)
}
