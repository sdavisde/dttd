import { isNil } from 'lodash'
import { CHARole } from '@/lib/weekend/types'

// Fees are stored per weekend group (docs/specs/18-spec-weekend-group-fees).
// A group with no fee is "not tracked": nobody in it is expected to pay, which
// is what keeps groups from before fee tracking off the outstanding list. No
// server imports so everything here stays unit-testable.

/** A group's price. Fees are the cash price; online adds the surcharge. */
export type GroupFees = {
  teamFee: number
  candidateFee: number
  onlineSurcharge: number
}

/** A weekend group whose fees are set. */
export type TrackedGroup = {
  groupId: string
  groupNumber: number | null
  fees: GroupFees
}

/**
 * Roles that never owe the team fee. They may still choose to pay, which is
 * recorded like any other payment.
 *
 * TODO(tenancy): becomes a per-community flag on role data once roles are
 * stored per community.
 */
export const FEE_EXEMPT_CHA_ROLES: ReadonlySet<string> = new Set([
  CHARole.HEAD_SPIRITUAL_DIRECTOR,
  CHARole.SPIRITUAL_DIRECTOR,
  CHARole.SPIRITUAL_DIRECTOR_TRAINEE,
])

export function isFeeExemptRole(chaRole: string | null): boolean {
  return !isNil(chaRole) && FEE_EXEMPT_CHA_ROLES.has(chaRole)
}

/**
 * A candidate owes their fee once approved — approving is what asks for
 * payment. Money paid earlier still counts toward it.
 */
const CANDIDATE_OWING_STATUSES: ReadonlySet<string> = new Set([
  'awaiting_payment',
  'confirmed',
])

export function candidateOwesFee(status: string | null): boolean {
  return !isNil(status) && CANDIDATE_OWING_STATUSES.has(status)
}

/** What an online payer is charged for a fee. */
export function onlinePriceOf(fee: number, fees: GroupFees): number {
  return fee + fees.onlineSurcharge
}

/** Reads a group's fee columns; null when the group isn't tracked. */
export function groupFeesFromColumns(row: {
  team_fee: number | null
  candidate_fee: number | null
  online_surcharge: number | null
}): GroupFees | null {
  if (
    isNil(row.team_fee) ||
    isNil(row.candidate_fee) ||
    isNil(row.online_surcharge)
  ) {
    return null
  }
  return {
    teamFee: Number(row.team_fee),
    candidateFee: Number(row.candidate_fee),
    onlineSurcharge: Number(row.online_surcharge),
  }
}

/**
 * Parses a whole-or-cents dollar amount typed by an admin ("200", "212.50").
 * Null for anything that isn't a non-negative amount with at most two decimals.
 */
export function parseFeeAmount(raw: string): number | null {
  const value = raw.trim().replace(/^\$/, '')
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  return Number(value)
}

/** "$200", or "$212.50" when there are cents. */
export function formatFee(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * "$200 cash · $210 online" — one line for a group whose team and candidate
 * fees match (DTTD's case), both named when they differ.
 */
export function formatGroupPrice(fees: GroupFees): string {
  const price = (fee: number) =>
    `${formatFee(fee)} cash · ${formatFee(onlinePriceOf(fee, fees))} online`
  return fees.teamFee === fees.candidateFee
    ? price(fees.teamFee)
    : `Team ${price(fees.teamFee)}; candidates ${price(fees.candidateFee)}`
}
