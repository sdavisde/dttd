import { capitalize } from '@/lib/utils'
import { Weekend, WeekendGroupWithId, WeekendStatus } from './types'

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

export const formatWeekendTitle = (weekend: Weekend) => {
  const weekendTypeLabel = capitalize(weekend.type.toLowerCase())
  if (weekend.title) {
    // Remove mens or womens if it's in the weekend title already so that we can add it at the beginning consistently.
    const reducedTitle = weekend.title.replace(/mens|Mens|Womens|womens/g, '')
    return `${weekendTypeLabel} ${reducedTitle}`
  }

  const numberSuffix = weekend.number ? ` #${weekend.number}` : ''
  return `${weekendTypeLabel}${numberSuffix}`
}

// Get the status of a weekend group (both MENS and WOMENS should have same status)
export const getGroupStatus = (
  group: WeekendGroupWithId
): WeekendStatus | null => {
  return group.weekends.MENS?.status ?? group.weekends.WOMENS?.status ?? null
}
