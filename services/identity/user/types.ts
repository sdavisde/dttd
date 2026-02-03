import { Tables } from '@/database.types'

/**
 * Shape of user data returned from the repository queries.
 * Matches the GetAllUserInfoQuery select shape exactly.
 */
export type RawUser = Tables<'users'> & {
  user_roles: Array<{
    roles: Tables<'roles'>
  }>
  weekend_roster: Array<{
    id: string
    user_id: string | null
    weekend_id: string | null
    cha_role: string | null
    status: string | null
    weekends: Pick<Tables<'weekends'>, 'type' | 'status'> | null
  }>
}
