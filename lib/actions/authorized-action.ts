import 'server-only'
import { Result, err, isErr } from '@/lib/results'
import { getLoggedInUser } from '@/services/identity/user/user-service'
import { Permission, userHasPermission } from '@/lib/security'

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
