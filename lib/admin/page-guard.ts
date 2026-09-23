import { redirect } from 'next/navigation'
import { Errors } from '@/lib/error'
import * as Results from '@/lib/results'
import type { Permission } from '@/lib/security'
import { permissionLock, userHasPermission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import { isNil } from 'lodash'

export type PageGuardOptions = {
  /** Permissions required to view the page (any one suffices, per userHasPermission). */
  required?: Permission[]
  /** Permissions that unlock editing; drives the derived `canEdit` boolean. */
  edit?: Permission[]
}

export type PageGuardDecision =
  | { allowed: true; canEdit: boolean }
  | { allowed: false; reason: string }

/**
 * Pure decision logic shared by the async guard — a thin wrapper over the
 * existing lib/security checks, with no behavior changes.
 */
export function evaluatePageGuard(
  user: User | null,
  options: PageGuardOptions = {}
): PageGuardDecision {
  if (isNil(user)) {
    return { allowed: false, reason: Errors.NOT_LOGGED_IN.toString() }
  }
  // Empty required ⇒ the layout's portal gate is enough (permissionLock with
  // an empty list would deny everyone without FULL_ACCESS).
  const required = options.required ?? []
  if (required.length > 0) {
    try {
      permissionLock(required)(user)
    } catch (error: unknown) {
      return { allowed: false, reason: (error as Error).message }
    }
  }
  const canEdit = isNil(options.edit)
    ? false
    : userHasPermission(user, options.edit)
  return { allowed: true, canEdit }
}

/**
 * Shared per-page permission preamble for rebuilt admin pages: fetches the
 * logged-in user, enforces the required permissions with today's redirect
 * behavior, and derives `canEdit`.
 */
export async function guardAdminPage(
  options: PageGuardOptions = {}
): Promise<{ user: User; canEdit: boolean }> {
  // Imported lazily so the pure decision logic above stays testable without
  // dragging the server-only service chain into Jest.
  const { getLoggedInUser } = await import('@/services/identity/user')
  const userResult = await getLoggedInUser()
  const user = Results.isErr(userResult) ? null : (userResult.data ?? null)
  const decision = evaluatePageGuard(user, options)
  if (!decision.allowed) {
    redirect(`/?error=${decision.reason}`)
  }
  return { user: user as User, canEdit: decision.canEdit }
}
