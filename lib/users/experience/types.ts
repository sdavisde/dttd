import { Tables } from '@/database.types'
import { CHARole } from '@/lib/weekend/types'

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

export type UserExperienceRecord = Tables<'users_experience'>

export type ExperienceEntry = {
  id: string
  weekend: string // todo: update this to be the consistent format of weekend reference we want
  role: CHARole
  rollo: string | null // An optional field that clarifies the rollo if the user was a table leader
  date: string
}

export type GroupedExperience = {
  community: string
  records: ExperienceEntry[]
}

export type UserServiceHistory = {
  level: ExperienceLevel
  rectorReady: RectorReadyStatus
  groupedExperience: GroupedExperience[]
  totalWeekends: number
  totalDTTDWeekends: number
}
