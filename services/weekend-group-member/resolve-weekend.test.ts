import { chooseGroupMemberWeekend } from './resolve-weekend'

const MENS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const WOMENS_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

const GROUP_WEEKENDS = [
  { id: MENS_ID, type: 'MENS' },
  { id: WOMENS_ID, type: 'WOMENS' },
]

describe('chooseGroupMemberWeekend', () => {
  it('returns null when the member is on no roster', () => {
    expect(chooseGroupMemberWeekend([], GROUP_WEEKENDS, 'male')).toBeNull()
  })

  it('uses the single rostered weekend, ignoring gender', () => {
    // A member whose account carries the wrong gender must still resolve to
    // the weekend they actually serve on — this was the original bug.
    expect(chooseGroupMemberWeekend([WOMENS_ID], GROUP_WEEKENDS, 'male')).toBe(
      WOMENS_ID
    )
    expect(chooseGroupMemberWeekend([MENS_ID], GROUP_WEEKENDS, 'female')).toBe(
      MENS_ID
    )
  })

  it('deduplicates multiple roster rows on the same weekend', () => {
    expect(
      chooseGroupMemberWeekend([MENS_ID, MENS_ID], GROUP_WEEKENDS, 'female')
    ).toBe(MENS_ID)
  })

  it('breaks a dual-server tie with the gender-matched weekend', () => {
    expect(
      chooseGroupMemberWeekend([MENS_ID, WOMENS_ID], GROUP_WEEKENDS, 'female')
    ).toBe(WOMENS_ID)
    expect(
      chooseGroupMemberWeekend([MENS_ID, WOMENS_ID], GROUP_WEEKENDS, 'male')
    ).toBe(MENS_ID)
  })

  it('treats unknown gender as male for the tiebreak (matches legacy behavior)', () => {
    expect(
      chooseGroupMemberWeekend([MENS_ID, WOMENS_ID], GROUP_WEEKENDS, null)
    ).toBe(MENS_ID)
  })

  it('falls back to the first rostered weekend when the tiebreak cannot match', () => {
    expect(chooseGroupMemberWeekend([WOMENS_ID, MENS_ID], [], 'female')).toBe(
      WOMENS_ID
    )
  })
})
