import {
  TAGS,
  eventsForGroupTags,
  groupFeesTags,
  weekendGroupTags,
} from './tags'

const GROUP = 'd0000004-0000-0000-0000-000000000000'

describe('cache tags', () => {
  it('keys per-record tags by the record id', () => {
    expect(TAGS.weekendGroup(GROUP)).toBe(`weekend-group:${GROUP}`)
    expect(TAGS.eventsForGroup(GROUP)).toBe(`events:group:${GROUP}`)
  })

  it('keeps the table-wide tags distinct from one another', () => {
    const wide = [
      TAGS.weekends,
      TAGS.events,
      TAGS.roles,
      TAGS.settings,
      TAGS.groupFees,
    ]
    expect(new Set(wide).size).toBe(wide.length)
  })

  it('pairs every per-record tag with its table-wide tag', () => {
    expect(weekendGroupTags(GROUP)).toEqual([
      TAGS.weekends,
      TAGS.weekendGroup(GROUP),
    ])
    expect(eventsForGroupTags(GROUP)).toEqual([
      TAGS.events,
      TAGS.eventsForGroup(GROUP),
    ])
    expect(groupFeesTags(GROUP)).toEqual([
      TAGS.groupFees,
      TAGS.weekendGroup(GROUP),
    ])
  })
})
