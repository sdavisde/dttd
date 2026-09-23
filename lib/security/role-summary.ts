import type { Permission } from '@/lib/security'
import {
  ADMIN_ACCESS_PERMISSION,
  FULL_ACCESS_PERMISSION,
  PERMISSION_LABELS,
  PERMISSION_LADDERS,
  SENSITIVE_PERMISSIONS,
  ladderPermissions,
} from './permission-areas'

/**
 * The "What this role can do" card: the effective permission set (own ∪
 * inherited) split into what the role can and cannot do, in the order the
 * editor lists them — admin access, then each ladder, then sensitive data.
 * Full access short-circuits to a single line.
 */

export type RoleSummary =
  | { kind: 'full-access' }
  | { kind: 'split'; can: Permission[]; cant: Permission[] }

/** Every permission the summary speaks to, in display order. */
export function summarisedPermissions(): Permission[] {
  return [
    ADMIN_ACCESS_PERMISSION,
    ...PERMISSION_LADDERS.flatMap(ladderPermissions),
    ...SENSITIVE_PERMISSIONS.map((s) => s.permission),
  ]
}

export function summariseRole(effective: ReadonlySet<Permission>): RoleSummary {
  if (effective.has(FULL_ACCESS_PERMISSION)) return { kind: 'full-access' }
  const all = summarisedPermissions()
  return {
    kind: 'split',
    can: all.filter((p) => effective.has(p)),
    cant: all.filter((p) => !effective.has(p)),
  }
}

/** "See candidates · See weekends · …" — the verb phrases joined for one column. */
export function phraseList(permissions: readonly Permission[]): string {
  return permissions.map((p) => PERMISSION_LABELS[p]).join(' · ')
}
