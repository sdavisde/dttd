import { isNil } from 'lodash'
import { parseCommunityWeekendRef } from '@/lib/weekend'

type ServedRecord = { weekend_reference: string }

/**
 * Condenses a person's service history into the one-line summary the People
 * board shows beside the Experience card heading — e.g.
 * `served DTTD #10, #11 · CTD #5`. Returns null when there is nothing to show.
 *
 * DTTD always leads; other communities follow alphabetically. Weekend
 * references that don't parse are appended verbatim rather than dropped.
 */
export function formatServedSummary(
  experience: ServedRecord[] | null | undefined
): string | null {
  if (isNil(experience) || experience.length === 0) return null

  const byCommunity = new Map<string, Set<number>>()
  const unparsed: string[] = []

  for (const record of experience) {
    const ref = parseCommunityWeekendRef(record.weekend_reference)
    if (isNil(ref)) {
      if (record.weekend_reference.trim() !== '') {
        unparsed.push(record.weekend_reference.trim())
      }
      continue
    }
    const numbers = byCommunity.get(ref.community) ?? new Set<number>()
    numbers.add(ref.number)
    byCommunity.set(ref.community, numbers)
  }

  const communities = Array.from(byCommunity.keys()).sort((a, b) => {
    if (a === b) return 0
    if (a === 'DTTD') return -1
    if (b === 'DTTD') return 1
    return a.localeCompare(b)
  })

  const parts = communities.map((community) => {
    const numbers = Array.from(byCommunity.get(community) ?? []).sort(
      (a, b) => a - b
    )
    return `${community} ${numbers.map((n) => `#${n}`).join(', ')}`
  })

  for (const raw of Array.from(new Set(unparsed))) {
    parts.push(raw)
  }

  if (parts.length === 0) return null
  return `served ${parts.join(' · ')}`
}
