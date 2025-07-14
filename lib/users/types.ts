import { TeamMemberInfo } from '@/lib/weekend/types'

export type User = {
  id: string
  first_name: string | null
  last_name: string | null
  gender: string | null
  email: string
  phone_number: string | null
  role: UserRoleInfo | null
  /** Contains information about this user's CHA role and status if they are on the upcoming weekend team roster */
  team_member_info: TeamMemberInfo | null
}

export type UserRoleInfo = {
  label: string
  permissions: Array<string>
}
