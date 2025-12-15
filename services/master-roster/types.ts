import { CommunityInformation } from '@/lib/users/types'
import { Address } from '@/lib/users/validation'
import { UserExperience } from '@/lib/users/experience'

export type MasterRosterMember = {
  id: string
  firstName: string | null
  lastName: string | null
  gender: string | null
  email: string | null
  phoneNumber: string | null
  address: Address | null
  communityInformation: CommunityInformation
  roles: Array<{ id: string; label: string }>
  permissions: Array<string>
  experience: Array<UserExperience>
}

export type MasterRoster = {
  members: Array<MasterRosterMember>
}
