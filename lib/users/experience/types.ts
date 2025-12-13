import { Tables } from '@/database.types'
import { UserExperience } from './validation'

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

/**
 * User experience records tied to a specific community
 */
export type GroupedExperience = {
  community: string
  records: UserExperience[]
}

/**
 * A helpful configuration of fields to help understand a user's experience
 * and render various UI around it.
 */
export type UserServiceHistory = {
  level: ExperienceLevel
  rectorReady: RectorReadyStatus
  experience: Array<UserExperience>
  totalWeekends: number
  totalDTTDWeekends: number
}
