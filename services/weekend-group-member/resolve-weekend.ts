import { isNil } from 'lodash'

/** A weekend within a group, as needed for payment-weekend resolution. */
export type GroupWeekendRef = {
  id: string
  type: string
}

/**
 * Chooses the weekend a group member's payments belong to, from the weekends
 * they are actively rostered on.
 *
 * - Rostered on exactly one weekend → that weekend. The roster is the source
 *   of truth; gender plays no part here.
 * - Rostered on both weekends of the group (dual-server) → the weekend
 *   matching the member's gender. The team fee is per-weekend and
 *   dual-servers typically pay once (the other fee is covered by donations),
 *   so either attribution is financially defensible — the own-gender weekend
 *   is the natural one.
 * - Rostered on none → null. Callers must treat this as "cannot attribute",
 *   never guess.
 */
export function chooseGroupMemberWeekend(
  rosterWeekendIds: string[],
  groupWeekends: GroupWeekendRef[],
  gender: string | null
): string | null {
  const distinctIds = [...new Set(rosterWeekendIds)]

  if (distinctIds.length === 0) return null
  if (distinctIds.length === 1) return distinctIds[0]

  const genderType = gender === 'female' ? 'WOMENS' : 'MENS'
  const genderWeekend = groupWeekends.find(
    (w) => w.type === genderType && distinctIds.includes(w.id)
  )
  if (!isNil(genderWeekend)) return genderWeekend.id

  // Gender-matched weekend is not among the rostered ones (or the group data
  // is incomplete) — fall back to the first rostered weekend, deterministically.
  return distinctIds[0]
}
