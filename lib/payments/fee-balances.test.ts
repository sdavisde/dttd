import {
  buildFeeAccounts,
  deriveFeeBalances,
  type FeeCandidate,
  type FeeGroupMember,
  type FeeRosterRow,
  type FeeWeekend,
} from './fee-balances'
import type { TrackedGroup } from './group-fees'
import { makePayment } from './test-fixtures'

const g12: TrackedGroup = {
  groupId: 'group-12',
  groupNumber: 12,
  fees: { teamFee: 200, candidateFee: 200, onlineSurcharge: 10 },
}
const g13: TrackedGroup = {
  groupId: 'group-13',
  groupNumber: 13,
  fees: { teamFee: 225, candidateFee: 250, onlineSurcharge: 10 },
}

const weekends: FeeWeekend[] = [
  { id: 'w12-mens', groupId: 'group-12', number: 12, type: 'MENS' },
  { id: 'w12-womens', groupId: 'group-12', number: 12, type: 'WOMENS' },
  { id: 'w13-mens', groupId: 'group-13', number: 13, type: 'MENS' },
  { id: 'w13-womens', groupId: 'group-13', number: 13, type: 'WOMENS' },
  // #11 isn't tracked: no fees set.
  { id: 'w11-mens', groupId: 'group-11', number: 11, type: 'MENS' },
]

const row = (overrides: Partial<FeeRosterRow>): FeeRosterRow => ({
  id: 'roster-1',
  weekendId: 'w12-mens',
  userId: 'user-ann',
  chaRole: 'Rover',
  status: null,
  name: 'Ann Simmons',
  ...overrides,
})

const candidate = (overrides: Partial<FeeCandidate>): FeeCandidate => ({
  id: 'candidate-1',
  weekendId: 'w12-mens',
  status: 'confirmed',
  name: 'David Park',
  sponsorName: 'Tom Bailey',
  paymentOwner: 'sponsor',
  ...overrides,
})

const member = (
  id: string,
  groupId: string,
  userId: string
): FeeGroupMember => ({ id, groupId, userId })

function balances({
  groups = [g12, g13],
  rosterRows = [],
  candidates = [],
  groupMembers = [],
  payments = [],
}: {
  groups?: TrackedGroup[]
  rosterRows?: FeeRosterRow[]
  candidates?: FeeCandidate[]
  groupMembers?: FeeGroupMember[]
  payments?: Parameters<typeof buildFeeAccounts>[0]['payments']
}) {
  return deriveFeeBalances(
    buildFeeAccounts({
      groups,
      weekends,
      rosterRows,
      candidates,
      groupMembers,
      payments,
    })
  )
}

describe('fee balances', () => {
  it("prices each person from their own group's fees", () => {
    const { outstanding } = balances({
      candidates: [
        candidate({ id: 'c12', weekendId: 'w12-mens' }),
        candidate({ id: 'c13', weekendId: 'w13-womens' }),
      ],
    })
    expect(outstanding.map((f) => [f.targetId, f.amountDue])).toEqual([
      ['c12', 200],
      ['c13', 250],
    ])
  })

  it('skips groups whose fees are not set', () => {
    const { outstanding } = balances({
      candidates: [candidate({ id: 'c11', weekendId: 'w11-mens' })],
      rosterRows: [row({ weekendId: 'w11-mens' })],
    })
    expect(outstanding).toEqual([])
  })

  it('counts a candidate as owing only once approved', () => {
    const { outstanding } = balances({
      candidates: [
        candidate({ id: 'sponsored', status: 'sponsored' }),
        candidate({ id: 'forms', status: 'awaiting_forms' }),
        candidate({ id: 'pending', status: 'pending_approval' }),
        candidate({ id: 'approved', status: 'awaiting_payment' }),
        candidate({ id: 'confirmed', status: 'confirmed' }),
        candidate({ id: 'rejected', status: 'rejected' }),
      ],
    })
    expect(outstanding.map((f) => f.targetId)).toEqual([
      'approved',
      'confirmed',
    ])
  })

  it('names the sponsor as expected payer unless the candidate pays', () => {
    const { outstanding } = balances({
      candidates: [
        candidate({ id: 'a' }),
        candidate({ id: 'b', paymentOwner: 'candidate', name: 'Luis Moreno' }),
      ],
    })
    expect(outstanding.map((f) => f.expectedPayer)).toEqual([
      'Tom Bailey',
      'Luis Moreno',
    ])
  })

  it('exempts all three spiritual director roles', () => {
    const { outstanding } = balances({
      rosterRows: [
        row({ id: 'r1', userId: 'u1', chaRole: 'Head Spiritual Director' }),
        row({ id: 'r2', userId: 'u2', chaRole: 'Spiritual Director' }),
        row({
          id: 'r3',
          userId: 'u3',
          chaRole: 'Spiritual Director Trainee',
        }),
        row({ id: 'r4', userId: 'u4', chaRole: 'Rover' }),
      ],
    })
    expect(outstanding.map((f) => f.targetId)).toEqual(['r4'])
  })

  it("lists a spiritual director's voluntary payment as a gift, never owed", () => {
    const { outstanding, overpaid } = balances({
      rosterRows: [row({ chaRole: 'Spiritual Director' })],
      groupMembers: [member('gm-ann', 'group-12', 'user-ann')],
      payments: [
        makePayment({
          target_type: 'weekend_group_member',
          target_id: 'gm-ann',
          gross_amount: 200,
        }),
      ],
    })
    expect(outstanding).toEqual([])
    expect(overpaid.map((a) => [a.standing, a.amountOver])).toEqual([
      ['exempt', 200],
    ])
  })

  it('charges a dual-server one fee per group, listed under Men’s', () => {
    const { outstanding } = balances({
      rosterRows: [
        row({ id: 'womens-row', weekendId: 'w12-womens', chaRole: 'Head' }),
        row({ id: 'mens-row', weekendId: 'w12-mens', chaRole: 'Rover' }),
      ],
      groupMembers: [member('gm-ann', 'group-12', 'user-ann')],
    })
    expect(outstanding).toHaveLength(1)
    expect(outstanding[0]).toMatchObject({
      targetType: 'weekend_group_member',
      targetId: 'gm-ann',
      weekendType: 'MENS',
      chaRole: 'Rover',
      amountDue: 200,
    })
    expect(outstanding[0].legacyTargetIds.sort()).toEqual([
      'mens-row',
      'womens-row',
    ])
  })

  it('charges the same person separately in each group they serve', () => {
    const { outstanding } = balances({
      rosterRows: [
        row({ id: 'r12', weekendId: 'w12-mens' }),
        row({ id: 'r13', weekendId: 'w13-mens' }),
      ],
      groupMembers: [
        member('gm-12', 'group-12', 'user-ann'),
        member('gm-13', 'group-13', 'user-ann'),
      ],
    })
    expect(outstanding.map((f) => [f.targetId, f.amountDue])).toEqual([
      ['gm-12', 200],
      ['gm-13', 225],
    ])
  })

  it('counts older payments recorded against a roster row', () => {
    const { outstanding } = balances({
      rosterRows: [row({})],
      groupMembers: [member('gm-ann', 'group-12', 'user-ann')],
      payments: [
        makePayment({
          target_type: 'weekend_roster',
          target_id: 'roster-1',
          gross_amount: 200,
        }),
      ],
    })
    expect(outstanding).toEqual([])
  })

  it('settles a cash payer at the fee and an online payer at fee + surcharge', () => {
    const { outstanding, overpaid } = balances({
      candidates: [candidate({ id: 'cash' }), candidate({ id: 'online' })],
      payments: [
        makePayment({ id: 'p1', target_id: 'cash', gross_amount: 200 }),
        makePayment({
          id: 'p2',
          target_id: 'online',
          gross_amount: 210,
          payment_method: 'stripe',
          payment_intent_id: 'pi_1',
        }),
      ],
    })
    expect(outstanding).toEqual([])
    expect(overpaid).toEqual([])
  })

  it('shows only the balance after a partial payment', () => {
    const { outstanding } = balances({
      candidates: [candidate({})],
      payments: [makePayment({ gross_amount: 120 })],
    })
    expect(outstanding[0]).toMatchObject({ coveredSoFar: 120, amountDue: 80 })
  })

  it('treats a waived fee as covered and ignores voided payments', () => {
    const { outstanding } = balances({
      candidates: [candidate({ id: 'waived' }), candidate({ id: 'voided' })],
      payments: [
        makePayment({
          id: 'p1',
          target_id: 'waived',
          payment_method: 'waived',
          gross_amount: 200,
        }),
        makePayment({
          id: 'p2',
          target_id: 'voided',
          gross_amount: 200,
          voided_at: '2026-09-01T00:00:00.000Z',
        }),
      ],
    })
    expect(outstanding.map((f) => f.targetId)).toEqual(['voided'])
  })

  it('flags a double payment as overpaid by the extra', () => {
    const { overpaid } = balances({
      candidates: [candidate({})],
      payments: [
        makePayment({ id: 'p1', gross_amount: 200 }),
        makePayment({ id: 'p2', gross_amount: 200 }),
      ],
    })
    expect(overpaid.map((a) => [a.standing, a.amountOver])).toEqual([
      ['owes', 200],
    ])
  })

  it('flags money from a dropped member or a rejected candidate', () => {
    const { outstanding, overpaid } = balances({
      rosterRows: [row({ status: 'drop' })],
      candidates: [candidate({ id: 'rej', status: 'rejected' })],
      groupMembers: [member('gm-ann', 'group-12', 'user-ann')],
      payments: [
        makePayment({
          id: 'p1',
          target_type: 'weekend_group_member',
          target_id: 'gm-ann',
          gross_amount: 200,
        }),
        makePayment({ id: 'p2', target_id: 'rej', gross_amount: 200 }),
      ],
    })
    expect(outstanding).toEqual([])
    expect(overpaid.map((a) => a.standing).sort()).toEqual([
      'dropped',
      'rejected',
    ])
  })

  it('flags money on a tracked weekend for someone on no list', () => {
    const { overpaid } = balances({
      payments: [
        makePayment({
          target_id: 'deleted-candidate',
          weekend_id: 'w12-mens',
          gross_amount: 200,
        }),
        // Untracked group: not our business.
        makePayment({ id: 'p2', target_id: 'old', weekend_id: 'w11-mens' }),
      ],
    })
    expect(overpaid.map((a) => [a.targetId, a.standing])).toEqual([
      ['deleted-candidate', 'not-on-roster'],
    ])
  })
})
