import { UserExperienceFormValue } from '@/components/team-forms/schemas'
import { GroupedExperience } from './types'

/**
 * Un-groups experience records into a flat array
 */
export const flattenExperience = (
  groupedExperience: Array<GroupedExperience>
): Array<UserExperienceFormValue> => {
  return groupedExperience.flatMap((groupedExperience) =>
    groupedExperience.records.map((record) => ({
      id: record.id,
      cha_role: record.cha_role,
      weekend_reference: record.weekend_reference,
      rollo: record.rollo,
      served_date: record.served_date,
    }))
  )
}
