import { mapValues } from 'lodash'
import { ExperienceEntry, GroupedExperience } from './types'

export const flattenExperience = (
  groupedExperience: Array<GroupedExperience>
): Array<ExperienceEntry> => {
  return Object.values(
    mapValues(
      groupedExperience,
      (groupedExperience) => groupedExperience.records
    )
  )
}
