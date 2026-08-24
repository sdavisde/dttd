import 'server-only'
import type { Result } from '@/lib/results'
import { err, isErr } from '@/lib/results'
// Imported from the module directly rather than the service barrel: the barrel pulls in
// `actions.ts`, which imports this file, and the resulting cycle breaks at build time.
import { getLoggedInUser } from '@/services/identity/user/current-user'
import type { Permission } from '@/lib/security'
import { userHasPermission } from '@/lib/security'

/**
 * A wrapper for server actions that ensures the user is authenticated and has the required permission.
 *
 * @param requiredPermission - The permission required to execute the action. If null, only authentication is required.
 * @param action - The action to execute if the user is authorized.
 */
export const authorizedAction = <T, R>(
  requiredPermission: Permission,
  action: (data: T) => Promise<Result<string, R>>
) => {
  return async (data: T): Promise<Result<string, R>> => {
    try {
      // 1. Authenticate and get user
      const userResult = await getLoggedInUser()

      if (isErr(userResult)) {
        return err('Unauthorized: User not authenticated')
      }

      const user = userResult.data

      if (!userHasPermission(user, [requiredPermission])) {
        return err(`Forbidden: Missing permission ${requiredPermission}`)
      }

      // 3. Execute action
      return await action(data)
    } catch (error) {
      console.error('Unexpected error in authorized action:', error)
      return err('Internal Server Error')
    }
  }
}

/**
 * A wrapper for server actions that a member may run against their own record, and
 * that a privileged user may run against anybody's.
 *
 * This covers the shape the plain {@link authorizedAction} cannot: forms like the team
 * info sheet, where an ordinary member edits their own details and an admin edits the
 * same fields from the master roster. Gating those on a permission alone would lock
 * members out of their own data.
 *
 * @param requiredPermission - The permission needed to act on someone *else's* record.
 * @param action - The action to execute if the caller is authorized.
 */
export const authorizedSelfOrPermissionAction = <
  T extends { userId: string },
  R,
>(
  requiredPermission: Permission,
  action: (data: T) => Promise<Result<string, R>>
) => {
  return async (data: T): Promise<Result<string, R>> => {
    try {
      const userResult = await getLoggedInUser()

      if (isErr(userResult)) {
        return err('Unauthorized: User not authenticated')
      }

      const user = userResult.data
      const isEditingSelf = user.id === data.userId

      if (!isEditingSelf && !userHasPermission(user, [requiredPermission])) {
        return err(`Forbidden: Missing permission ${requiredPermission}`)
      }

      return await action(data)
    } catch (error) {
      console.error('Unexpected error in authorized action:', error)
      return err('Internal Server Error')
    }
  }
}
