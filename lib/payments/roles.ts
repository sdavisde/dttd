import { isNil } from 'lodash'

// Which CHA role a payment's person served in. Pure so both the payment
// service (resolving stored payments) and the tests can share it.

/** A weekend_roster row reduced to what a role lookup needs. */
export type RosterRoleRow = {
  weekendId: string | null
  chaRole: string | null
}

/**
 * The role to show for a payment targeting a group member, who may be rostered
 * on both of the group's weekends.
 *
 * The payment's own weekend wins. A payment with no weekend (or one whose
 * weekend has no roster row) falls back to the member's only roster row —
 * never to an arbitrary one of two, which would be a guess.
 */
export function pickRoleForWeekend(
  rows: RosterRoleRow[],
  weekendId: string | null
): string | null {
  const onWeekend = isNil(weekendId)
    ? undefined
    : rows.find((row) => row.weekendId === weekendId)
  if (!isNil(onWeekend)) return onWeekend.chaRole
  return rows.length === 1 ? rows[0].chaRole : null
}
