import type { FeeAccount } from './fee-balances'
import { describeFeeChangeImpact } from './fee-change-impact'

const account = (overrides: Partial<FeeAccount>): FeeAccount => ({
  targetType: 'candidate',
  targetId: 'c1',
  legacyTargetIds: [],
  name: 'David Park',
  expectedPayer: null,
  chaRole: null,
  weekendId: 'w',
  weekendNumber: 13,
  weekendType: 'MENS',
  groupId: 'g13',
  standing: 'owes',
  paidOnline: false,
  feeAmount: 200,
  coveredSoFar: 0,
  amountDue: 200,
  amountOver: 0,
  ...overrides,
})

describe('describeFeeChangeImpact', () => {
  it('says who will owe more after a raise, and how many already paid', () => {
    const before = [
      account({ targetId: 'paid', coveredSoFar: 200, amountDue: 0 }),
      account({ targetId: 'unpaid' }),
    ]
    const after = [
      account({
        targetId: 'paid',
        feeAmount: 225,
        coveredSoFar: 200,
        amountDue: 25,
      }),
      account({ targetId: 'unpaid', feeAmount: 225, amountDue: 225 }),
    ]
    expect(describeFeeChangeImpact(before, after)).toEqual({
      payerCount: 1,
      moreOwed: { people: 2, total: 50, alreadyPaid: 1 },
      newlyOverpaid: { people: 0, total: 0 },
    })
  })

  it('says who will be overpaid after a cut', () => {
    const before = [account({ coveredSoFar: 200, amountDue: 0 })]
    const after = [
      account({
        feeAmount: 175,
        coveredSoFar: 200,
        amountDue: 0,
        amountOver: 25,
      }),
    ]
    expect(describeFeeChangeImpact(before, after).newlyOverpaid).toEqual({
      people: 1,
      total: 25,
    })
  })

  it('treats a group that starts tracking fees as everyone newly owing', () => {
    const after = [account({ targetId: 'a' }), account({ targetId: 'b' })]
    expect(describeFeeChangeImpact([], after).moreOwed).toEqual({
      people: 2,
      total: 400,
      alreadyPaid: 0,
    })
  })
})
