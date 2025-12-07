import { capitalize } from '@/lib/utils'
import {
  Weekend,
  WeekendGroupWithId,
  WeekendStatusValue,
} from './types'

export const genderMatchesWeekend = (
  gender: string | null,
  weekendType: string | null
) => {
  if (!gender || !weekendType) return false
  return (
    (gender === 'male' && weekendType === 'MENS') ||
    (gender === 'female' && weekendType === 'WOMENS')
  )
}

export const trimWeekendTypeFromTitle = (title: string) => {
  return title.replace(/mens|Mens|Womens|womens/g, '')
}

export const formatWeekendTitle = (weekend: Weekend) => {
  const weekendTypeLabel = capitalize(weekend.type.toLowerCase())
  if (weekend.title) {
    // Remove mens or womens if it's in the weekend title already so that we can add it at the beginning consistently.
    const reducedTitle = trimWeekendTypeFromTitle(weekend.title)
    return `${weekendTypeLabel} ${reducedTitle}`
  }

  const numberSuffix = weekend.number ? ` #${weekend.number}` : ''
  return `${weekendTypeLabel}${numberSuffix}`
}

// Get the status of a weekend group (both MENS and WOMENS should have same status)
export const getGroupStatus = (
  group: WeekendGroupWithId
): WeekendStatusValue | null => {
  return group.weekends.MENS?.status ?? group.weekends.WOMENS?.status ?? null
}
