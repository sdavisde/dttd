import {
  deriveGroupSlots,
  GROUP_SINGLETON_EVENT_TYPES,
} from './scheduling-slots'
import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'

function event(type: EventTypeValue, id = 1): Event {
  return {
    id,
    title: null,
    datetime: '2026-09-06T14:00:00Z',
    location: null,
    endDatetime: null,
    weekendGroupId: 'g1',
    weekendId: null,
    type,
    createdAt: '2026-01-01T00:00:00Z',
  }
}

describe('GROUP_SINGLETON_EVENT_TYPES', () => {
  it('is the group types minus meetings', () => {
    expect(GROUP_SINGLETON_EVENT_TYPES).toEqual(['secuela'])
  })
})

describe('deriveGroupSlots', () => {
  it('counts every meeting as its own slot alongside the secuela', () => {
    const events = [
      event('meeting', 1),
      event('meeting', 2),
      event('meeting', 3),
      event('meeting', 4),
    ]
    expect(deriveGroupSlots(events)).toEqual({
      total: 5,
      filled: 4,
      missing: ['secuela'],
      meetingCount: 4,
    })
  })

  it('fills the meter once the secuela is scheduled', () => {
    const events = [
      event('meeting', 1),
      event('meeting', 2),
      event('secuela', 3),
    ]
    expect(deriveGroupSlots(events)).toEqual({
      total: 3,
      filled: 3,
      missing: [],
      meetingCount: 2,
    })
  })

  it('keeps growing the denominator past the old fixed total of four', () => {
    const events = [
      event('meeting', 1),
      event('meeting', 2),
      event('meeting', 3),
      event('meeting', 4),
      event('meeting', 5),
      event('secuela', 6),
    ]
    const slots = deriveGroupSlots(events)
    expect(slots.total).toBe(6)
    expect(slots.filled).toBe(6)
  })

  it('ignores weekend-level events', () => {
    const events = [event('sendoff', 1), event('closing', 2)]
    expect(deriveGroupSlots(events)).toEqual({
      total: 1,
      filled: 0,
      missing: ['secuela'],
      meetingCount: 0,
    })
  })

  it('reports an empty schedule as nothing filled', () => {
    expect(deriveGroupSlots([])).toEqual({
      total: 1,
      filled: 0,
      missing: ['secuela'],
      meetingCount: 0,
    })
  })
})
