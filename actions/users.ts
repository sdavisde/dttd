'use server'

import { Result } from '@/lib/results'
import { Address } from '@/lib/users/validation'
import { BasicInfo } from '@/components/team-forms/schemas'

// Import the new actions
import * as IdentityUserActions from '@/services/identity/user'

export async function updateUserAddress(userId: string, address: Address): Promise<Result<string, null>> {
    return IdentityUserActions.updateUserAddress(userId, address)
}

export async function deleteUser(userId: string): Promise<Result<string, null>> {
    return IdentityUserActions.deleteUser(userId)
}

export async function removeUserRole(userId: string): Promise<Result<string, null>> {
    return IdentityUserActions.removeUserRole(userId)
}

export async function updateUserBasicInfo(userId: string, data: BasicInfo): Promise<Result<string, null>> {
  return IdentityUserActions.updateUserBasicInfo(userId, data)
}
