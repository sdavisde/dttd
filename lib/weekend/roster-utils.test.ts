import { getRoleSortOrder, sortRosterByRole } from './roster-utils'
import { CHARole } from './types'

describe('getRoleSortOrder', () => {
  it('orders roles by their position in the CHARole enum', () => {
    expect(getRoleSortOrder(CHARole.RECTOR)).toBeLessThan(
      getRoleSortOrder(CHARole.HEAD)
    )
    expect(getRoleSortOrder(CHARole.HEAD)).toBeLessThan(
      getRoleSortOrder(CHARole.ROVER)
    )
  })

  it('sorts unknown roles after every known role', () => {
    expect(getRoleSortOrder('Not A Real Role')).toBeGreaterThan(
      getRoleSortOrder(CHARole.ROVER)
    )
  })

  it('sorts members with no role last', () => {
    expect(getRoleSortOrder(null)).toBeGreaterThan(
      getRoleSortOrder('Not A Real Role')
    )
  })
})

describe('sortRosterByRole', () => {
  it('sorts members into CHA role order', () => {
    const roster = [
      { cha_role: CHARole.ROVER, name: 'rover' },
      { cha_role: null, name: 'unassigned' },
      { cha_role: CHARole.RECTOR, name: 'rector' },
      { cha_role: CHARole.HEAD, name: 'head' },
    ]

    expect(sortRosterByRole(roster).map((m) => m.name)).toEqual([
      'rector',
      'head',
      'rover',
      'unassigned',
    ])
  })

  it('keeps the incoming order of members sharing a role', () => {
    const roster = [
      { cha_role: CHARole.ROVER, name: 'second' },
      { cha_role: CHARole.RECTOR, name: 'rector' },
      { cha_role: CHARole.ROVER, name: 'third' },
    ]

    expect(sortRosterByRole(roster).map((m) => m.name)).toEqual([
      'rector',
      'second',
      'third',
    ])
  })

  it('does not mutate the input array', () => {
    const roster = [{ cha_role: CHARole.ROVER }, { cha_role: CHARole.RECTOR }]
    const snapshot = [...roster]

    sortRosterByRole(roster)

    expect(roster).toEqual(snapshot)
  })
})
