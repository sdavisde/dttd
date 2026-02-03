import { Tables } from '@/lib/supabase/database.types'
import { Permission } from '@/lib/security'

export type RoleType = 'INDIVIDUAL' | 'COMMITTEE'

export type Role = Omit<Tables<'roles'>, 'permissions'> & {
  permissions: Permission[]
  type: RoleType
  description: string | null
}
