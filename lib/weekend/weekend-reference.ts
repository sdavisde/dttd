import { isNil } from 'lodash'
import type { Weekend, WeekendType } from './types'
import { COMMUNITY_NAME } from './constants'

/**
 * A weekend as the outside world names it: a community and a number, nothing
 * more. This is deliberately under-specified — it cannot tell you which of the
 * two gendered weekends is meant, and it is not tied to a row in our database.
 *
 * Use it for weekends we don't own: an attendee's "I walked DTTD #11", or a
 * visitor's weekend from another community. This is the shape persisted in
 * `users_experience.weekend_reference` and `users.weekend_attended` as the
 * string `DTTD#11` — that encoding is on disk, so {@link formatCommunityWeekendRef}
 * and {@link parseCommunityWeekendRef} must stay in sync and must not be
 * repurposed for display.
 */
export type CommunityWeekendRef = {
  community: string
  number: number
}

/**
 * A weekend in our system, fully identified. Every field is required: if you
 * can't say which gender it is, you have a {@link CommunityWeekendRef}, not
 * one of these.
 *
 * This is an *identity*, not the record — dates, status and id live on
 * {@link Weekend}. Build one with {@link toWeekendRef} and render it with
 * `getWeekendLabel` from `./labels`.
 */
export type WeekendRef = CommunityWeekendRef & {
  gender: WeekendType
}

export type AnyWeekendRef = CommunityWeekendRef | WeekendRef

/** Narrows a ref to the fully-qualified kind. */
export function isWeekendRef(ref: AnyWeekendRef): ref is WeekendRef {
  return 'gender' in ref && !isNil(ref.gender)
}

export function toCommunityWeekendRef(input: {
  community?: string
  number: number
}): CommunityWeekendRef {
  return {
    community: input.community ?? COMMUNITY_NAME,
    number: input.number,
  }
}

export function toWeekendRef(input: {
  community?: string
  number: number
  gender: WeekendType
}): WeekendRef {
  return {
    community: input.community ?? COMMUNITY_NAME,
    number: input.number,
    gender: input.gender,
  }
}

/**
 * Builds a qualified ref from a weekend record. Returns null when the weekend
 * is not attached to a numbered group, since a ref without a number cannot
 * identify anything.
 */
export function weekendToRef(
  weekend: Pick<Weekend, 'number' | 'type'>,
  community: string = COMMUNITY_NAME
): WeekendRef | null {
  if (isNil(weekend.number)) return null
  return toWeekendRef({
    community,
    number: weekend.number,
    gender: weekend.type,
  })
}

/**
 * Encodes a community ref for storage, e.g. `DTTD#11`.
 *
 * This is a wire format, not a label. For anything a user reads, use
 * `getWeekendLabel` from `./labels`.
 */
export function formatCommunityWeekendRef(ref: CommunityWeekendRef): string {
  return `${ref.community}#${ref.number}`
}

/**
 * Decodes a stored `DTTD#11` string. Returns null for anything unparseable so
 * callers handle bad data explicitly rather than propagating NaN.
 */
export function parseCommunityWeekendRef(
  value: string | null | undefined
): CommunityWeekendRef | null {
  if (isNil(value)) return null

  const [community, numberPart] = value.split('#')
  const number = parseInt(numberPart)
  if (isEmptyish(community) || Number.isNaN(number)) return null

  return { community, number }
}

function isEmptyish(value: string | undefined): boolean {
  return isNil(value) || value.trim() === ''
}
