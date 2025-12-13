import { UserExperienceFormValue } from '@/components/team-forms/schemas'
import { WeekendReference } from '@/lib/weekend/weekend-reference'
import { UserExperience } from './validation'

/**
 * Normalizes experience records into a flat array of form values
 */
export const experienceToFormValues = (
  experience: Array<UserExperience>
): Array<UserExperienceFormValue> => {
  return experience.map((experience) => {
    const { community, weekend_number } = WeekendReference.fromString(
      experience.weekend_reference
    )
    return {
      id: experience.id,
      cha_role: experience.cha_role,
      rollo: experience.rollo,
      community,
      weekend_number: weekend_number.toString(),
    }
  })
}
