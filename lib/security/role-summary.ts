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
 * inherited) split into what the role can and cannot do, each side grouped by
 * area — the ladders in the order the editor lists them, then sensitive data,
 * then access. Full access short-circuits to a single line.
 */

/** The two area headings that are not a permission ladder. */
export const SENSITIVE_AREA_LABEL = 'Sensitive data'
export const ACCESS_AREA_LABEL = 'Access'

export type SummaryGroup = {
  /** The heading above the lines — a ladder label, or one of the two above. */
  area: string
  /** Short verb phrases, one per line, in display order. Never empty. */
  phrases: string[]
}

export type RoleSummary =
  | { kind: 'full-access' }
  | { kind: 'split'; can: SummaryGroup[]; cant: SummaryGroup[] }

type SummaryArea = { area: string; permissions: readonly Permission[] }

/** Every area the summary speaks to, in display order. */
export function summaryAreas(): SummaryArea[] {
  return [
    ...PERMISSION_LADDERS.map((ladder) => ({
      area: ladder.label,
      permissions: ladderPermissions(ladder),
    })),
    {
      area: SENSITIVE_AREA_LABEL,
      permissions: SENSITIVE_PERMISSIONS.map((item) => item.permission),
    },
    { area: ACCESS_AREA_LABEL, permissions: [ADMIN_ACCESS_PERMISSION] },
  ]
}

/** Every permission the summary speaks to, in display order. */
export function summarisedPermissions(): Permission[] {
  return summaryAreas().flatMap((area) => area.permissions)
}

/** Areas that keep at least one permission, as phrase lists. Empty areas drop out. */
function groupPhrases(
  keep: (permission: Permission) => boolean
): SummaryGroup[] {
  return summaryAreas()
    .map(({ area, permissions }) => ({
      area,
      phrases: permissions.filter(keep).map((p) => PERMISSION_LABELS[p]),
    }))
    .filter((group) => group.phrases.length > 0)
}

export function summariseRole(effective: ReadonlySet<Permission>): RoleSummary {
  if (effective.has(FULL_ACCESS_PERMISSION)) return { kind: 'full-access' }
  return {
    kind: 'split',
    can: groupPhrases((permission) => effective.has(permission)),
    cant: groupPhrases((permission) => !effective.has(permission)),
  }
}

/** How many phrases a side holds — the count beside the card's heading. */
export function countPhrases(groups: readonly SummaryGroup[]): number {
  return groups.reduce((total, group) => total + group.phrases.length, 0)
}
