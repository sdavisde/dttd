import type { Permission } from '@/lib/security'
import type { PermissionLadder } from './permission-areas'
import { ladderPermissions } from './permission-areas'

/**
 * Pure helpers that turn a role's flat permission list into the ladders the
 * Security editor shows, and back again. Nothing here touches the database;
 * the editor calls `applyRung` when the admin clicks a rung and only the
 * resulting list is saved. Loading a role never rewrites its permissions.
 */

export type Rung = 'none' | 'view' | 'manage'

const RUNG_ORDER: Readonly<Record<Rung, number>> = {
  none: 0,
  view: 1,
  manage: 2,
}

export function compareRung(a: Rung, b: Rung): number {
  return RUNG_ORDER[a] - RUNG_ORDER[b]
}

export function maxRung(a: Rung, b: Rung): Rung {
  return compareRung(a, b) >= 0 ? a : b
}

/** The permissions a rung grants on a ladder (Manage includes View). */
export function rungPermissions(
  ladder: PermissionLadder,
  rung: Rung
): Permission[] {
  switch (rung) {
    case 'none':
      return []
    case 'view':
      return [...ladder.view]
    case 'manage':
      return ladderPermissions(ladder)
  }
}

/** The lowest rung a ladder can sit on: View when viewing needs no permission. */
export function baselineRung(ladder: PermissionLadder): Rung {
  return ladder.implicitView === true ? 'view' : 'none'
}

export type LadderState =
  | { kind: 'rung'; rung: Rung }
  | {
      kind: 'custom'
      /** The ladder's permissions the set actually holds. */
      present: Permission[]
      /** The highest rung whose permissions are all held. */
      satisfiedRung: Rung
      /** View permissions the set is missing. */
      missingForView: Permission[]
      /** Manage permissions held without the full Manage rung. */
      extraBeyondView: Permission[]
      /** Everything the set would need to reach Manage. */
      missingForManage: Permission[]
    }

function intersect(
  set: ReadonlySet<Permission>,
  list: readonly Permission[]
): Permission[] {
  return list.filter((p) => set.has(p))
}

function difference(
  list: readonly Permission[],
  set: ReadonlySet<Permission>
): Permission[] {
  return list.filter((p) => !set.has(p))
}

/**
 * Derives the ladder state of a permission set. The set lands on a rung only
 * when it holds exactly that rung's permissions for the ladder (no extras from
 * a higher rung, nothing missing); otherwise the state is Custom.
 */
export function deriveLadderState(
  ladder: PermissionLadder,
  permissions: ReadonlySet<Permission>
): LadderState {
  const present = intersect(permissions, ladderPermissions(ladder))
  const presentSet = new Set(present)
  const hasAllView = ladder.view.every((p) => presentSet.has(p))
  const hasAllManage = ladder.manage.every((p) => presentSet.has(p))
  const hasAnyManage = ladder.manage.some((p) => presentSet.has(p))

  if (present.length === 0) {
    return { kind: 'rung', rung: baselineRung(ladder) }
  }
  if (hasAllView && hasAllManage) {
    return { kind: 'rung', rung: 'manage' }
  }
  if (hasAllView && !hasAnyManage) {
    return { kind: 'rung', rung: 'view' }
  }

  return {
    kind: 'custom',
    present,
    satisfiedRung: hasAllView ? 'view' : baselineRung(ladder),
    missingForView: difference(ladder.view, presentSet),
    extraBeyondView: intersect(presentSet, ladder.manage),
    missingForManage: difference(ladderPermissions(ladder), presentSet),
  }
}

/** The rung a state counts as when comparing (Custom counts as its satisfied rung). */
export function rungOf(state: LadderState): Rung {
  return state.kind === 'rung' ? state.rung : state.satisfiedRung
}

/**
 * Returns the role's own permissions after setting a ladder to `rung`.
 * Inherited permissions are never written into the role (they arrive through
 * the parent), so the own list only carries what the rung needs beyond them.
 * Every other ladder's permissions are left untouched.
 */
export function applyRung(
  ladder: PermissionLadder,
  own: readonly Permission[],
  inherited: ReadonlySet<Permission>,
  rung: Rung
): Permission[] {
  const ladderSet = new Set(ladderPermissions(ladder))
  const kept = own.filter((p) => !ladderSet.has(p))
  const wanted = rungPermissions(ladder, rung).filter((p) => !inherited.has(p))
  return [...kept, ...wanted]
}

/** Returns the role's own permissions after switching one permission on or off. */
export function applySwitch(
  own: readonly Permission[],
  permission: Permission,
  on: boolean
): Permission[] {
  const without = own.filter((p) => p !== permission)
  return on ? [...without, permission] : without
}

export type LadderProvenance =
  /** Nothing on this ladder from anywhere. */
  | 'none'
  /** The displayed rung comes entirely from the parent role. */
  | 'inherited'
  /** The parent grants a lower rung and this role raises it. */
  | 'raised'
  /** The parent grants nothing here; this role adds it. */
  | 'own'

export type ResolvedLadder = {
  ladder: PermissionLadder
  /** What the role effectively grants (own ∪ inherited). */
  effective: LadderState
  /** The rung the parent chain already guarantees; rungs below it are locked. */
  inheritedRung: Rung
  provenance: LadderProvenance
}

/**
 * Resolves how a ladder should render for a role: the effective state (own ∪
 * inherited), the rung the parent locks in, and where the grant comes from.
 */
export function resolveLadder(
  ladder: PermissionLadder,
  own: ReadonlySet<Permission>,
  inherited: ReadonlySet<Permission>
): ResolvedLadder {
  const effectiveSet = new Set<Permission>([...own, ...inherited])
  const effective = deriveLadderState(ladder, effectiveSet)
  const inheritedState = deriveLadderState(ladder, inherited)
  const inheritedRung = rungOf(inheritedState)
  const baseline = baselineRung(ladder)

  const inheritedPresent =
    intersect(inherited, ladderPermissions(ladder)).length > 0
  const ownPresent = intersect(own, ladderPermissions(ladder)).length > 0

  let provenance: LadderProvenance
  if (!inheritedPresent) {
    provenance = ownPresent ? 'own' : 'none'
  } else if (compareRung(rungOf(effective), inheritedRung) > 0) {
    provenance = 'raised'
  } else if (effective.kind === 'custom' && ownPresent) {
    // Parent gives a rung, this role adds pieces that do not complete the next one.
    provenance = 'raised'
  } else {
    provenance = 'inherited'
  }

  return {
    ladder,
    effective,
    inheritedRung: maxRung(inheritedRung, baseline),
    provenance,
  }
}

export type ResolvedSwitch = {
  permission: Permission
  /** Effectively granted (own or inherited). */
  on: boolean
  /** Granted by the parent chain, so it cannot be switched off here. */
  locked: boolean
}

export function resolveSwitch(
  permission: Permission,
  own: ReadonlySet<Permission>,
  inherited: ReadonlySet<Permission>
): ResolvedSwitch {
  const locked = inherited.has(permission)
  return { permission, on: locked || own.has(permission), locked }
}
