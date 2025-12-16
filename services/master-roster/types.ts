import { CommunityInformation } from '@/lib/users/types'
import { Address } from '@/lib/users/validation'
import { UserExperience } from '@/lib/users/experience/validation'

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
  level: ExperienceLevel
  rectorReady: RectorReadyStatus
  experience: Array<UserExperience>
}

export type MasterRoster = {
  members: Array<MasterRosterMember>
}

// User experience types

export type ExperienceLevel = 1 | 2 | 3

export type RectorReadyCriteria = {
  hasServedHeadOrAssistantHead: boolean
  hasServedTeamHead: boolean
  hasGivenTwoOrMoreTalks: boolean
  hasWorkedDining: boolean
}

export type RectorReadyStatus = {
  isReady: boolean
  criteria: RectorReadyCriteria
}

export type ExperienceLevelDistribution = {
  count: number
  percentage: number
}

export type ExperienceDistribution = {
  level1: ExperienceLevelDistribution
  level2: ExperienceLevelDistribution
  level3: ExperienceLevelDistribution
  total: number
}

export type UserServiceHistory = {
  level: ExperienceLevel
  rectorReady: RectorReadyStatus
  experience: UserExperience[]
  totalWeekends: number
  totalDTTDWeekends: number
}

export type GroupedExperience = {
  community: string
  records: UserExperience[]
}

export type UserExperienceRecord = {
  weekend_id: string | null
  weekend_reference: string
}
