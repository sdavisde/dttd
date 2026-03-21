import type { Tables } from '@/database.types'

/**
 * Shape of user data returned from the repository queries.
 * Matches the GetAllUserInfoQuery select shape exactly.
 */
export type RawUser = Tables<'users'> & {
  user_roles: Array<{
    roles: Tables<'roles'>
  }>
  /**
   * All weekend group memberships for this user, each representing one
   * (group_id, user_id) pair. Nested joins bring in the group's weekends and
   * the user's roster rows for those weekends so normalizeUser can derive
   * TeamMemberInfo without additional round-trips.
   */
  weekend_group_members: Array<{
    /** weekend_group_members.id — the shared row for forms and payment */
    id: string
    /** FK to weekend_groups.id */
    group_id: string
    /** Nested join: the weekend_group this member belongs to */
    weekend_groups: {
      /** The weekend group number (e.g. 11 for "DTTD #11") */
      number: number | null
      /** All weekends in this group (typically MENS + WOMENS) */
      weekends: Array<{
        id: string
        type: string | null
        /** 'ACTIVE' | 'PLANNING' | 'FINISHED' — used to filter to the active group */
        status: string | null
        /** The user's roster row(s) in this weekend (empty if not assigned) */
        weekend_roster: Array<{
          id: string
          cha_role: string | null
          rollo: string | null
          additional_cha_role: string | null
          status: string | null
          weekend_id: string | null
        }>
      }>
    } | null
  }>
}
