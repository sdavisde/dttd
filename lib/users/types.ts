import { TeamMemberInfo } from '@/lib/weekend/types'
import { Address } from './validation'

export type User = {
  id: string
  first_name: string | null
  last_name: string | null
  gender: string | null
  email: string
  phone_number: string | null
  address: Address | null
  church_affiliation: string | null
  weekend_attended: string | null
  essentials_training_date: string | null
  role: UserRoleInfo | null
  /** Contains information about this user's CHA role and status if they are on the upcoming weekend team roster */
  team_member_info: TeamMemberInfo | null
}

export type TeamMemberUser = Omit<User, 'team_member_info'> & {
  team_member_info: TeamMemberInfo
}

export type UserRoleInfo = {
  id: string
  label: string
  permissions: Array<string>
}
