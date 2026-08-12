import { isNil } from 'lodash'
import type { Weekend } from './types'
import { WeekendType } from './types'
import { COMMUNITY_NAME } from './constants'
import type { AnyWeekendRef } from './weekend-reference'
import { isWeekendRef, weekendToRef } from './weekend-reference'

/**
 * How the gender segment of a weekend label is rendered.
 * - `short`: "Mens" / "Womens" — the canonical form used in weekend labels.
 * - `possessive`: "Men's" / "Women's" — for prose where the label isn't the subject.
 */
export type WeekendGenderStyle = 'short' | 'possessive'

export type WeekendLabelOptions = {
  /**
   * Include the gender segment. Defaults to true whenever the ref has one.
   * Set false for group-level labels that cover both weekends.
   */
  includeGender?: boolean
  /** Defaults to `short`. */
  genderStyle?: WeekendGenderStyle
}

const GENDER_LABELS: Record<WeekendType, Record<WeekendGenderStyle, string>> = {
  [WeekendType.MENS]: { short: 'Mens', possessive: "Men's" },
  [WeekendType.WOMENS]: { short: 'Womens', possessive: "Women's" },
}

/**
 * Renders just the gender segment, e.g. "Mens" or "Men's".
 * Returns null when the gender is unknown so callers can omit the segment.
 */
export function formatWeekendGender(
  gender: WeekendType | null | undefined,
  style: WeekendGenderStyle = 'short'
): string | null {
  if (isNil(gender)) return null
  return GENDER_LABELS[gender]?.[style] ?? null
}

/**
 * The single source of truth for how a weekend is labelled across the app.
 *
 * Takes a whole ref rather than loose parts, so changing the format is a
 * one-file change no matter how many places render a weekend.
 *
 * - `DTTD Mens #12` — a qualified {@link WeekendRef} (the default)
 * - `DTTD #12`      — a {@link CommunityWeekendRef}, or `includeGender: false`
 */
export function getWeekendLabel(
  ref: AnyWeekendRef,
  options: WeekendLabelOptions = {}
): string {
  const { includeGender = true, genderStyle = 'short' } = options

  const gender =
    includeGender && isWeekendRef(ref)
      ? formatWeekendGender(ref.gender, genderStyle)
      : null

  return [ref.community, gender, `#${ref.number}`]
    .filter((segment): segment is string => !isNil(segment))
    .join(' ')
}

/**
 * Labels a weekend from whatever parts a caller happens to have — typically a
 * join that carries the group number and type but nothing else.
 *
 * Prefer {@link getWeekendLabel} when you can build a real ref; this is the
 * tolerant variant for partial data, degrading to "DTTD Mens" or "DTTD #12"
 * rather than rendering a bogus number or an empty string.
 */
export function formatWeekendLabelFor(
  parts: {
    number: number | null | undefined
    gender: WeekendType | null | undefined
    community?: string
  },
  options: WeekendLabelOptions = {}
): string {
  const community = parts.community ?? COMMUNITY_NAME

  if (!isNil(parts.number) && !isNil(parts.gender)) {
    return getWeekendLabel(
      { community, number: parts.number, gender: parts.gender },
      options
    )
  }

  if (!isNil(parts.number)) {
    return formatWeekendGroupTitle(parts.number, community)
  }

  const gender =
    options.includeGender === false
      ? null
      : formatWeekendGender(parts.gender, options.genderStyle)

  return [community, gender]
    .filter((segment): segment is string => !isNil(segment))
    .join(' ')
}

/**
 * Labels a weekend record, deriving every segment from its own fields.
 * e.g. "DTTD Mens #12"
 */
export function formatWeekendTitle(
  weekend: Weekend,
  options?: WeekendLabelOptions
): string {
  const ref = weekendToRef(weekend)
  if (!isNil(ref)) return getWeekendLabel(ref, options)

  return formatWeekendLabelFor(
    { number: weekend.number, gender: weekend.type },
    options
  )
}

/**
 * Labels the weekend group a weekend belongs to — the same format minus the
 * gender segment, since a group covers both weekends. e.g. "DTTD #12"
 */
export function formatWeekendGroupTitle(
  number: number | null | undefined,
  community: string = COMMUNITY_NAME
): string {
  if (isNil(number)) return community
  return getWeekendLabel({ community, number })
}
