import type { VolunteerStatus } from './types'

/**
 * The secuela event window used to determine volunteer status.
 *
 * - `startDate`: when the secuela event begins (ISO 8601 string)
 * - `endDate`: when the secuela event ends (ISO 8601 string, optional)
 *
 * If `endDate` is provided, a user who signed in on or before `endDate`
 * is considered to have attended. If `endDate` is null, any sign-in on
 * the same calendar day (UTC) as `startDate` counts as attendance.
 */
export type SecuelaEvent = {
  startDate: string
  endDate: string | null
}

/**
 * Determines a community member's volunteer status based on when they
 * signed in relative to the secuela event.
 *
 * Rules:
 * 1. If there is no secuela event defined, return `'none'` — we can't
 *    determine attendance without a reference event.
 * 2. If the user has no sign-in timestamp, return `'none'`.
 * 3. If the event has an end datetime:
 *    - Sign-in on or before the end datetime → `'attended_secuela'`
 *      (generous: early sign-ins before the event starts still count)
 *    - Sign-in after the end datetime → `'wants_to_serve'`
 * 4. If the event has no end datetime (start only):
 *    - Sign-in on the same calendar day (UTC) as the start → `'attended_secuela'`
 *    - Sign-in on a later day → `'wants_to_serve'`
 */
export function computeVolunteerStatus(
  signInTimestamp: string | null,
  secuelaEvent: SecuelaEvent | null
): VolunteerStatus {
  if (secuelaEvent === null) return 'none'
  if (signInTimestamp === null) return 'none'

  if (secuelaEvent.endDate !== null) {
    return signInTimestamp <= secuelaEvent.endDate
      ? 'attended_secuela'
      : 'wants_to_serve'
  }

  // No end date — give credit for the entire calendar day (UTC)
  const eventDay = secuelaEvent.startDate.slice(0, 10)
  const signInDay = signInTimestamp.slice(0, 10)

  return signInDay <= eventDay ? 'attended_secuela' : 'wants_to_serve'
}
