import 'server-only'

import * as UserService from './user-service'
import { findImpersonatingUser } from '@/services/identity/impersonation/impersonation-service'

/**
 * Resolves the user behind the current request, honouring an active impersonation.
 *
 * This lives apart from `actions.ts` to keep the module graph acyclic. Every guarded
 * action in `actions.ts` imports `authorizedAction`, and `authorizedAction` needs to
 * know who is calling -- routing that through the service's barrel export would mean
 * `authorized-action` and `actions` each waiting on the other to initialize, which
 * surfaces as a "cannot access before initialization" crash at build time.
 */
export const getLoggedInUser = async () => {
  const impersonatingUser = await findImpersonatingUser()
  return await UserService.getLoggedInUser(impersonatingUser)
}
