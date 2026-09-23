import type { Event } from '@/services/events/types'
import {
  eventsForWeekend,
  findSingletonEventForWeekend,
  formatCompactDateRange,
  hubPath,
  resolveWeekendType,
  sendOffCountdown,
  upcomingEvents,
  weekendLocation,
} from './hub'

const MENS = {
  id: 'mens',
  groupId: 'g12',
  start_date: '2026-10-16',
  end_date: '2026-10-19',
}
const WOMENS = {
  id: 'womens',
  groupId: 'g12',
  start_date: '2026-10-23',
  end_date: '2026-10-26',
}

let nextId = 1
function event(overrides: Partial<Event>): Event {
  return {
    id: nextId++,
    title: 'Event',
    datetime: '2026-10-01T14:00:00Z',
    location: null,
    endDatetime: null,
    weekendGroupId: null,
    weekendId: null,
    type: 'other',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('hubPath', () => {
  it('keeps the overview at the group root and carries the weekend along', () => {
    expect(hubPath('g12')).toBe('/weekends/g12')
    expect(hubPath('g12', 'overview', 'MENS')).toBe(
      '/weekends/g12?weekend=MENS'
    )
    expect(hubPath('g12', 'team', 'WOMENS')).toBe(
      '/weekends/g12/team?weekend=WOMENS'
    )
    expect(hubPath('g12', 'review-candidates', 'MENS')).toBe(
      '/weekends/g12/review-candidates?weekend=MENS'
    )
  })
})

describe('resolveWeekendType', () => {
  it('honours a valid query parameter', () => {
    expect(resolveWeekendType('WOMENS', 'male')).toBe('WOMENS')
    expect(resolveWeekendType(['MENS'], 'female')).toBe('MENS')
  })

  it("falls back to the viewer's own weekend, then Men's", () => {
    expect(resolveWeekendType(undefined, 'female')).toBe('WOMENS')
    expect(resolveWeekendType('bogus', 'male')).toBe('MENS')
    expect(resolveWeekendType(null, null)).toBe('MENS')
  })
})

describe('formatCompactDateRange', () => {
  it('collapses a range inside one month', () => {
    expect(formatCompactDateRange('2026-10-16', '2026-10-19')).toBe(
      'October 16–19'
    )
  })

  it('spells out both months across a month boundary', () => {
    expect(formatCompactDateRange('2026-10-30', '2026-11-02')).toBe(
      'October 30 – November 2'
    )
  })

  it('adds the years only across a year boundary', () => {
    expect(formatCompactDateRange('2026-12-30', '2027-01-02')).toBe(
      'December 30, 2026 – January 2, 2027'
    )
  })

  it('returns null when a side is missing', () => {
    expect(formatCompactDateRange(null, '2026-10-19')).toBeNull()
    expect(formatCompactDateRange('2026-10-16', '')).toBeNull()
  })
})

describe('eventsForWeekend', () => {
  const mensOnly = event({ weekendId: 'mens', weekendGroupId: 'g12' })
  const womensOnly = event({ weekendId: 'womens', weekendGroupId: 'g12' })
  const groupWide = event({
    weekendGroupId: 'g12',
    datetime: '2026-09-06T14:00:00Z',
  })
  const otherGroup = event({ weekendGroupId: 'g11' })
  const community = event({ datetime: '2026-09-01T14:00:00Z' })
  const undated = event({ datetime: null, weekendGroupId: 'g12' })

  it("keeps the weekend's own, group-wide and community events, in date order", () => {
    const result = eventsForWeekend(
      [undated, mensOnly, womensOnly, groupWide, otherGroup, community],
      MENS
    )
    expect(result).toEqual([community, groupWide, mensOnly, undated])
  })
})

describe('upcomingEvents', () => {
  it('returns the next events on or after now, soonest first, capped', () => {
    const past = event({ datetime: '2026-08-01T00:00:00Z' })
    const soon = event({ datetime: '2026-09-06T14:00:00Z' })
    const later = event({ datetime: '2026-09-12T14:00:00Z' })
    const latest = event({ datetime: '2026-10-16T14:00:00Z' })
    const now = new Date('2026-09-03T12:00:00Z')
    expect(upcomingEvents([latest, past, later, soon], now, 2)).toEqual([
      soon,
      later,
    ])
  })
})

describe('findSingletonEventForWeekend', () => {
  it('prefers the row stamped with the weekend id', () => {
    const own = event({
      type: 'sendoff',
      weekendId: 'mens',
      weekendGroupId: 'g12',
    })
    const groupRow = event({ type: 'sendoff', weekendGroupId: 'g12' })
    expect(findSingletonEventForWeekend([groupRow, own], MENS, 'sendoff')).toBe(
      own
    )
  })

  it("falls back to the group row dated at the weekend's start", () => {
    const mensSendOff = event({
      type: 'sendoff',
      weekendGroupId: 'g12',
      datetime: '2026-10-15T23:30:00Z', // Oct 15, 6:30 PM CT — the eve
    })
    const womensSendOff = event({
      type: 'sendoff',
      weekendGroupId: 'g12',
      datetime: '2026-10-22T23:30:00Z',
    })
    const rows = [womensSendOff, mensSendOff]
    expect(findSingletonEventForWeekend(rows, MENS, 'sendoff')).toBe(
      mensSendOff
    )
    expect(findSingletonEventForWeekend(rows, WOMENS, 'sendoff')).toBe(
      womensSendOff
    )
  })

  it('returns null when nothing matches', () => {
    expect(findSingletonEventForWeekend([], MENS, 'sendoff')).toBeNull()
  })
})

describe('weekendLocation', () => {
  it("reads the place from the weekend's own event", () => {
    const row = event({
      type: 'weekend',
      weekendId: 'mens',
      weekendGroupId: 'g12',
      location: 'Camp Buckner',
    })
    expect(weekendLocation([row], MENS)).toBe('Camp Buckner')
  })

  it('is null when the event has no place', () => {
    const row = event({ type: 'weekend', weekendId: 'mens', location: '  ' })
    expect(weekendLocation([row], MENS)).toBeNull()
    expect(weekendLocation([], MENS)).toBeNull()
  })
})

describe('sendOffCountdown', () => {
  const sendOff = event({
    type: 'sendoff',
    weekendId: 'mens',
    weekendGroupId: 'g12',
    datetime: '2026-10-15T23:30:00Z',
  })

  it('counts calendar days to the send-off', () => {
    const now = new Date('2026-09-03T12:00:00Z')
    expect(sendOffCountdown([sendOff], MENS, now)).toEqual({
      kind: 'until',
      days: 42,
      label: 'Days until send-off',
    })
  })

  it('counts to the first day when there is no send-off event', () => {
    const now = new Date('2026-10-01T12:00:00Z')
    expect(sendOffCountdown([], MENS, now)).toEqual({
      kind: 'until',
      days: 15,
      label: 'Days until the weekend',
    })
  })

  it('says today on the day', () => {
    const now = new Date('2026-10-15T20:00:00Z')
    expect(sendOffCountdown([sendOff], MENS, now)).toEqual({
      kind: 'today',
      label: 'Send-off is today',
    })
  })

  it('reports an underway weekend', () => {
    const now = new Date('2026-10-17T20:00:00Z')
    expect(sendOffCountdown([sendOff], MENS, now).kind).toBe('underway')
  })

  it('counts days since a finished weekend', () => {
    const now = new Date('2026-10-25T20:00:00Z')
    expect(sendOffCountdown([sendOff], MENS, now)).toEqual({
      kind: 'since',
      days: 6,
      label: 'Days since the weekend',
    })
  })
})
