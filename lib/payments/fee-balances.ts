import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import {
  candidateOwesFee,
  isFeeExemptRole,
  type TrackedGroup,
} from './group-fees'
import type { FeePerson, OutstandingFee } from './outstanding'

// Who owes what, and who has paid more than they owe, across every weekend
// group whose fees are set. Fees are calculated, never stored: this is the
// pure half, fed by services/payment's getFeeBalances. No server imports so it
// stays unit-testable.

export type FeeWeekend = {
  id: string
  groupId: string
  number: number | null
  type: 'MENS' | 'WOMENS'
}

export type FeeRosterRow = {
  id: string
  weekendId: string | null
  userId: string | null
  chaRole: string | null
  /** 'drop' for a dropped team member. */
  status: string | null
  name: string | null
}

export type FeeCandidate = {
  id: string
  weekendId: string | null
  status: string | null
  name: string | null
  sponsorName: string | null
  /** The sponsorship form's "who is paying" answer. */
  paymentOwner: string | null
}

export type FeeGroupMember = {
  id: string
  groupId: string
  userId: string
}

/**
 * Why someone owes what they owe. Everyone but `owes` owes nothing, so any
 * money on record for them is more than they owe.
 */
export type FeeStanding =
  | 'owes'
  /** A spiritual director: never owes, may give. */
  | 'exempt'
  | 'dropped'
  | 'rejected'
  | 'not-approved'
  /** Money recorded against someone no longer on a roster or candidate list. */
  | 'not-on-roster'

export type FeeAccount = OutstandingFee & {
  groupId: string
  standing: FeeStanding
  /** True when any live payment for them was made online. */
  paidOnline: boolean
  /**
   * Paid beyond what they owe. The online surcharge never counts: someone who
   * paid online is settled at fee + surcharge, not in credit.
   */
  amountOver: number
}

export type FeeBalances = {
  /** People who still owe; `amountDue` is always greater than zero. */
  outstanding: FeeAccount[]
  /** People who paid more than they owe; `amountOver` is always greater than zero. */
  overpaid: FeeAccount[]
}

type FeeBalancesInput = {
  groups: TrackedGroup[]
  weekends: FeeWeekend[]
  rosterRows: FeeRosterRow[]
  candidates: FeeCandidate[]
  groupMembers: FeeGroupMember[]
  payments: PaymentTransactionDTO[]
}

const FEE_TARGET_TYPES = new Set([
  'candidate',
  'weekend_group_member',
  'weekend_roster',
])

const roundCents = (amount: number) => Math.round(amount * 100) / 100

type Coverage = { total: number; online: boolean }

/** Live money on record per target. Voided rows never count; waived rows do. */
function coverageByTarget(
  payments: PaymentTransactionDTO[]
): Map<string, Coverage> {
  const coverage = new Map<string, Coverage>()
  for (const p of payments) {
    if (!isNil(p.voided_at) || isNil(p.target_id)) continue
    const current = coverage.get(p.target_id) ?? { total: 0, online: false }
    coverage.set(p.target_id, {
      total: current.total + p.gross_amount,
      online: current.online || p.payment_method === 'stripe',
    })
  }
  return coverage
}

function weekendFields(weekend: FeeWeekend | undefined) {
  return {
    weekendId: weekend?.id ?? null,
    weekendNumber: weekend?.number ?? null,
    weekendType: weekend?.type ?? null,
  }
}

function toAccount(
  person: FeePerson,
  group: TrackedGroup,
  standing: FeeStanding,
  coverage: Map<string, Coverage>
): FeeAccount {
  const feeAmount =
    standing !== 'owes'
      ? 0
      : person.targetType === 'candidate'
        ? group.fees.candidateFee
        : group.fees.teamFee

  let coveredSoFar = 0
  let paidOnline = false
  for (const id of [person.targetId, ...person.legacyTargetIds]) {
    const c = coverage.get(id)
    if (isNil(c)) continue
    coveredSoFar += c.total
    paidOnline = paidOnline || c.online
  }

  const settledAt =
    feeAmount === 0
      ? 0
      : feeAmount + (paidOnline ? group.fees.onlineSurcharge : 0)

  return {
    ...person,
    groupId: group.groupId,
    standing,
    feeAmount,
    coveredSoFar: roundCents(coveredSoFar),
    paidOnline,
    amountDue: roundCents(Math.max(feeAmount - coveredSoFar, 0)),
    amountOver: roundCents(Math.max(coveredSoFar - settledAt, 0)),
  }
}

/**
 * One account per person per tracked group: every team member (one fee per
 * group, however many weekends they serve, listed under the Men's weekend),
 * every candidate, and anyone with money on a tracked weekend who is on
 * neither list — so no payment can drop out of view.
 */
export function buildFeeAccounts({
  groups,
  weekends,
  rosterRows,
  candidates,
  groupMembers,
  payments,
}: FeeBalancesInput): FeeAccount[] {
  const groupById = new Map(groups.map((g) => [g.groupId, g]))
  const weekendById = new Map(
    weekends.filter((w) => groupById.has(w.groupId)).map((w) => [w.id, w])
  )
  const memberIdByGroupUser = new Map(
    groupMembers.map((m) => [`${m.groupId}:${m.userId}`, m.id])
  )
  const coverage = coverageByTarget(payments)
  const accounts: FeeAccount[] = []

  // Team: group each person's roster rows within a group, Men's first so a
  // dual-server is listed there.
  const rowsByPerson = new Map<
    string,
    { group: TrackedGroup; rows: FeeRosterRow[] }
  >()
  const rows = rosterRows
    .filter((row) => !isNil(row.weekendId) && weekendById.has(row.weekendId))
    .sort((a, b) => {
      const aMens = weekendById.get(a.weekendId!)?.type === 'MENS' ? 0 : 1
      const bMens = weekendById.get(b.weekendId!)?.type === 'MENS' ? 0 : 1
      return aMens - bMens
    })
  for (const row of rows) {
    const weekend = weekendById.get(row.weekendId!)!
    const group = groupById.get(weekend.groupId)!
    const key = `${group.groupId}:${row.userId ?? row.id}`
    const entry = rowsByPerson.get(key) ?? { group, rows: [] }
    entry.rows.push(row)
    rowsByPerson.set(key, entry)
  }

  for (const { group, rows: personRows } of rowsByPerson.values()) {
    const active = personRows.filter((r) => r.status !== 'drop')
    const listed = active.at(0) ?? personRows[0]
    const groupMemberId = isNil(listed.userId)
      ? undefined
      : memberIdByGroupUser.get(`${group.groupId}:${listed.userId}`)
    // Payments target the group membership; the roster row is the fallback
    // for a member who somehow has none, and the home of older payments.
    const targetId = groupMemberId ?? listed.id

    const standing: FeeStanding =
      active.length === 0
        ? 'dropped'
        : active.every((r) => isFeeExemptRole(r.chaRole))
          ? 'exempt'
          : 'owes'

    accounts.push(
      toAccount(
        {
          targetType: isNil(groupMemberId)
            ? 'weekend_roster'
            : 'weekend_group_member',
          targetId,
          legacyTargetIds: personRows
            .map((r) => r.id)
            .filter((id) => id !== targetId),
          name: listed.name,
          expectedPayer: listed.name,
          chaRole: listed.chaRole,
          ...weekendFields(weekendById.get(listed.weekendId!)),
        },
        group,
        standing,
        coverage
      )
    )
  }

  for (const c of candidates) {
    const weekend = isNil(c.weekendId)
      ? undefined
      : weekendById.get(c.weekendId)
    if (isNil(weekend)) continue
    const standing: FeeStanding = candidateOwesFee(c.status)
      ? 'owes'
      : c.status === 'rejected'
        ? 'rejected'
        : 'not-approved'
    accounts.push(
      toAccount(
        {
          targetType: 'candidate',
          targetId: c.id,
          legacyTargetIds: [],
          name: c.name,
          expectedPayer:
            c.paymentOwner === 'candidate' ? c.name : c.sponsorName,
          // Candidates are guests, not team — they have no CHA role.
          chaRole: null,
          ...weekendFields(weekend),
        },
        groupById.get(weekend.groupId)!,
        standing,
        coverage
      )
    )
  }

  // Money on a tracked weekend for someone on neither list.
  const claimed = new Set(
    accounts.flatMap((a) => [a.targetId, ...a.legacyTargetIds])
  )
  const orphans = new Map<string, PaymentTransactionDTO>()
  for (const p of payments) {
    if (!isNil(p.voided_at) || isNil(p.target_id) || isNil(p.weekend_id))
      continue
    if (isNil(p.target_type) || !FEE_TARGET_TYPES.has(p.target_type)) continue
    if (claimed.has(p.target_id) || orphans.has(p.target_id)) continue
    if (!weekendById.has(p.weekend_id)) continue
    orphans.set(p.target_id, p)
  }
  for (const p of orphans.values()) {
    const weekend = weekendById.get(p.weekend_id!)!
    accounts.push(
      toAccount(
        {
          targetType: p.target_type as FeePerson['targetType'],
          targetId: p.target_id!,
          legacyTargetIds: [],
          name: p.target_name,
          expectedPayer: p.payment_owner,
          chaRole: p.cha_role,
          ...weekendFields(weekend),
        },
        groupById.get(weekend.groupId)!,
        'not-on-roster',
        coverage
      )
    )
  }

  return accounts
}

export function deriveFeeBalances(accounts: FeeAccount[]): FeeBalances {
  return {
    outstanding: accounts.filter((a) => a.amountDue > 0),
    overpaid: accounts.filter((a) => a.amountOver > 0),
  }
}
