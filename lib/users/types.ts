import { TeamMemberInfo } from '@/lib/weekend/types'
import { Address } from './validation'

export type CommunityInformation = {
  churchAffiliation: string | null
  weekendAttended: string | null
  essentialsTrainingDate: string | null
  specialGiftsAndSkills: string[] | null
}

export type User = {
  id: string
  firstName: string | null
  lastName: string | null
  gender: string | null
  email: string
  phoneNumber: string | null
  address: Address | null
  roles: Array<UserRoleInfo>
  permissions: Set<string>
  communityInformation: CommunityInformation
  /** Contains information about this user's CHA role and status if they are on the upcoming weekend team roster */
  teamMemberInfo: TeamMemberInfo | null
}

/**
 * A duplicate of User that requires `teamMemberInfo` so that it can be used safely
 */
export type TeamMemberUser = Omit<User, 'teamMemberInfo'> & {
  teamMemberInfo: TeamMemberInfo
}

export type UserRoleInfo = {
  id: string
  label: string
  permissions: Array<string>
}
