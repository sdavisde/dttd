import { isNil } from 'lodash'
import type { Permission } from '@/lib/security'
import type { Role, RoleInput } from '@/services/identity/roles'
import {
  getEffectivePermissions,
  wouldCreateCycle,
} from '@/services/identity/roles/inheritance'
import { FULL_ACCESS_PERMISSION } from '@/lib/security/permission-areas'

/**
 * Pure helpers behind the Security editor: what a role looks like as form
 * values, what it inherits from its parent, and which roles it may be based on.
 */

export function toRoleInput(role: Role): RoleInput {
  return {
    label: role.label,
    description: role.description ?? '',
    type: role.type,
    based_on_role_id: role.based_on_role_id,
    permissions: [...role.permissions],
  }
}

/** A new role starts as a copy of an existing one, with a blank name. */
export function draftFromRole(source: Role): RoleInput {
  return { ...toRoleInput(source), label: '' }
}

/** Everything the parent chain grants — the role's own permissions are not included. */
export function inheritedPermissions(
  basedOnRoleId: string | null,
  roles: readonly Role[]
): Set<Permission> {
  if (isNil(basedOnRoleId)) return new Set()
  return getEffectivePermissions(basedOnRoleId, roles)
}

/** Roles this one may be based on: not itself, and nothing that would form a loop. */
export function parentOptions(
  roleId: string | null,
  roles: readonly Role[]
): Role[] {
  return roles.filter((candidate) => {
    if (isNil(roleId)) return true
    if (candidate.id === roleId) return false
    return !wouldCreateCycle(roleId, candidate.id, roles)
  })
}

/** The default source for "New role": the first role that is not Full Access. */
export function defaultCopySource(roles: readonly Role[]): Role | null {
  return (
    roles.find(
      (role) =>
        !getEffectivePermissions(role.id, roles).has(FULL_ACCESS_PERMISSION)
    ) ??
    roles[0] ??
    null
  )
}

export function roleLabelById(
  roleId: string | null,
  roles: readonly Role[]
): string | null {
  if (isNil(roleId)) return null
  return roles.find((role) => role.id === roleId)?.label ?? null
}
