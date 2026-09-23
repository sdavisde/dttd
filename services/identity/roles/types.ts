import type { Tables } from '@/database.types'
import type { Permission } from '@/lib/security'

export type RoleType = 'INDIVIDUAL' | 'COMMITTEE'

export type Role = Omit<Tables<'roles'>, 'permissions'> & {
  /** The role's OWN permissions only — inherited ones arrive via `based_on_role_id`. */
  permissions: Permission[]
  type: RoleType
  description: string | null
  based_on_role_id: string | null
}

/** Everything the Security editor can set on a role. */
export type RoleInput = {
  label: string
  description: string
  type: RoleType
  based_on_role_id: string | null
  permissions: Permission[]
}

/** How a role is referenced elsewhere, so delete can explain why it is blocked. */
export type RoleUsage = {
  /** Distinct users holding this role directly. */
  userCount: number
  /** Roles that are based on this one (direct children). */
  dependentRoleIds: string[]
}

export type RoleUsageById = Record<string, RoleUsage>
