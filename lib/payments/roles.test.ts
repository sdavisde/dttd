import { pickRoleForWeekend, type RosterRoleRow } from './roles'

const row = (
  weekendId: string | null,
  chaRole: string | null
): RosterRoleRow => ({ weekendId, chaRole })

describe('pickRoleForWeekend', () => {
  it("takes the role from the payment's own weekend", () => {
    expect(
      pickRoleForWeekend(
        [row('weekend-mens', 'Head Dining'), row('weekend-womens', 'Rover')],
        'weekend-womens'
      )
    ).toBe('Rover')
  })

  it('falls back to the only roster row when the weekend is unknown', () => {
    expect(
      pickRoleForWeekend([row('weekend-mens', 'Table Leader')], null)
    ).toBe('Table Leader')
  })

  it('never guesses between two roster rows', () => {
    expect(
      pickRoleForWeekend(
        [row('weekend-mens', 'Head Dining'), row('weekend-womens', 'Rover')],
        null
      )
    ).toBeNull()
  })

  it('is null when the person is on no roster', () => {
    expect(pickRoleForWeekend([], 'weekend-mens')).toBeNull()
  })

  it('is null when the roster row carries no role', () => {
    expect(
      pickRoleForWeekend([row('weekend-mens', null)], 'weekend-mens')
    ).toBe(null)
  })
})
