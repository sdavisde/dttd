'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import * as ImperstonationService from './impersonation-service'
import { Results } from '@/lib/results'

type ImpersonateUserRequest = {
  userId: string
}
/**
 * Requires FULL_ACCESS - adds impersonation cookie to the response, and kicks off
 * the impersonation flow. Impersonation = view the site as another user.
 */
export const impersonateUser = authorizedAction<ImpersonateUserRequest, void>(
  Permission.FULL_ACCESS,
  async ({ userId }) =>
    Results.ok(await ImperstonationService.impersonateUser(userId))
)

/**
 * Don't really care to protect this function, since it's removing any impersonation cookies
 */
export async function clearImpersonation() {
  return ImperstonationService.clearImpersonation()
}
