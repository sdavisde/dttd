import {
  formatWeekendGender,
  formatWeekendGroupTitle,
  formatWeekendLabelFor,
  formatWeekendTitle,
  getWeekendLabel,
} from './labels'
import {
  formatCommunityWeekendRef,
  parseCommunityWeekendRef,
  toCommunityWeekendRef,
  toWeekendRef,
  weekendToRef,
} from './weekend-reference'
import type { Weekend } from './types'
import { WeekendStatus, WeekendType } from './types'

function makeWeekend(overrides: Partial<Weekend> = {}): Weekend {
  return {
    id: 'weekend-id',
    start_date: '2026-03-12',
    end_date: '2026-03-15',
    number: 12,
    status: WeekendStatus.PLANNING,
    title: null,
    type: WeekendType.MENS,
    groupId: 'group-id',
    ...overrides,
  }
}

describe('getWeekendLabel', () => {
  it('renders a qualified ref as "DTTD Mens #12"', () => {
    const ref = toWeekendRef({ number: 12, gender: WeekendType.MENS })
    expect(getWeekendLabel(ref)).toBe('DTTD Mens #12')
  })

  it('renders a womens weekend', () => {
    const ref = toWeekendRef({ number: 12, gender: WeekendType.WOMENS })
    expect(getWeekendLabel(ref)).toBe('DTTD Womens #12')
  })

  it('omits gender for a community-only ref', () => {
    const ref = toCommunityWeekendRef({ number: 11 })
    expect(getWeekendLabel(ref)).toBe('DTTD #11')
  })

  it('omits gender on request', () => {
    const ref = toWeekendRef({ number: 12, gender: WeekendType.MENS })
    expect(getWeekendLabel(ref, { includeGender: false })).toBe('DTTD #12')
  })

  it('supports the possessive style for prose', () => {
    const ref = toWeekendRef({ number: 12, gender: WeekendType.WOMENS })
    expect(getWeekendLabel(ref, { genderStyle: 'possessive' })).toBe(
      "DTTD Women's #12"
    )
  })

  it('honors a non-default community', () => {
    const ref = toWeekendRef({
      community: 'CHTD',
      number: 3,
      gender: WeekendType.MENS,
    })
    expect(getWeekendLabel(ref)).toBe('CHTD Mens #3')
  })
})

describe('formatWeekendTitle', () => {
  it('derives the label from the weekend record, ignoring any stored title', () => {
    const weekend = makeWeekend({ title: 'Mens DTTD#12' })
    expect(formatWeekendTitle(weekend)).toBe('DTTD Mens #12')
  })

  it('degrades gracefully when the weekend has no group number', () => {
    const weekend = makeWeekend({ number: null, groupId: null })
    expect(formatWeekendTitle(weekend)).toBe('DTTD Mens')
  })
})

describe('formatWeekendGroupTitle', () => {
  it('renders the group label without gender', () => {
    expect(formatWeekendGroupTitle(12)).toBe('DTTD #12')
  })

  it('falls back to the community when there is no number', () => {
    expect(formatWeekendGroupTitle(null)).toBe('DTTD')
  })
})

describe('formatWeekendLabelFor', () => {
  it('builds a full label from join-shaped parts', () => {
    expect(
      formatWeekendLabelFor({ number: 45, gender: WeekendType.WOMENS })
    ).toBe('DTTD Womens #45')
  })

  it('drops the gender segment when it is unknown', () => {
    expect(formatWeekendLabelFor({ number: 45, gender: null })).toBe('DTTD #45')
  })

  it('drops the number segment when it is unknown', () => {
    expect(
      formatWeekendLabelFor({ number: null, gender: WeekendType.MENS })
    ).toBe('DTTD Mens')
  })
})

describe('formatWeekendGender', () => {
  it('renders both styles', () => {
    expect(formatWeekendGender(WeekendType.MENS)).toBe('Mens')
    expect(formatWeekendGender(WeekendType.MENS, 'possessive')).toBe("Men's")
  })

  it('returns null when the gender is unknown', () => {
    expect(formatWeekendGender(null)).toBeNull()
  })
})

describe('community weekend ref encoding', () => {
  it('round-trips the persisted DTTD#11 format', () => {
    const ref = toCommunityWeekendRef({ number: 11 })
    const encoded = formatCommunityWeekendRef(ref)

    expect(encoded).toBe('DTTD#11')
    expect(parseCommunityWeekendRef(encoded)).toEqual(ref)
  })

  it('keeps the wire format distinct from the display label', () => {
    const ref = toWeekendRef({ number: 11, gender: WeekendType.MENS })

    expect(formatCommunityWeekendRef(ref)).toBe('DTTD#11')
    expect(getWeekendLabel(ref)).toBe('DTTD Mens #11')
  })

  it('returns null rather than NaN for unparseable input', () => {
    expect(parseCommunityWeekendRef('nonsense')).toBeNull()
    expect(parseCommunityWeekendRef('DTTD#')).toBeNull()
    expect(parseCommunityWeekendRef('#11')).toBeNull()
    expect(parseCommunityWeekendRef(null)).toBeNull()
  })
})

describe('weekendToRef', () => {
  it('builds a qualified ref from a weekend record', () => {
    expect(weekendToRef(makeWeekend())).toEqual({
      community: 'DTTD',
      number: 12,
      gender: WeekendType.MENS,
    })
  })

  it('returns null when the weekend has no number to identify it', () => {
    expect(weekendToRef(makeWeekend({ number: null }))).toBeNull()
  })
})
