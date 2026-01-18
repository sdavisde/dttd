import { User } from '@/lib/users/types'
import { isNil } from 'lodash'
import { cookies } from 'next/headers'
import { getUserById } from '@/services/identity/user/user-service'
import { Results } from '@/lib/results'

const IMPERSONATION_COOKIE_KEY = 'DTTD_IMPERSONATING_USER'

/**
 * This function should probably be locked down better
 * - technically any user with the right cookie could impersonate someone else.
 * But, since the cookie is only set by the system for a FULL_ACCESS user, I think we're probably okay
 */
export async function findImpersonatingUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const impersonatingUserId = cookieStore.get(IMPERSONATION_COOKIE_KEY)?.value

  if (isNil(impersonatingUserId)) {
    return null
  }

  const impersonatingUserResult = await getUserById(impersonatingUserId)
  Results.logFailures(impersonatingUserResult)
  return Results.toNullable(impersonatingUserResult)
}

export async function isImpersonatingUser(): Promise<boolean> {
  const cookieStore = await cookies()
  const impersonatingUserId = cookieStore.get(IMPERSONATION_COOKIE_KEY)?.value

  return !isNil(impersonatingUserId)
}

export async function impersonateUser(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATION_COOKIE_KEY, userId)
}

export async function clearImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete(IMPERSONATION_COOKIE_KEY)
}
