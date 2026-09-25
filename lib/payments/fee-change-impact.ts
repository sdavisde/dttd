import type { FeeAccount } from './fee-balances'

// What changing a group's fees does to the people in it, for the confirmation
// shown before the change is saved. Pure so it can be unit-tested.

export type FeeChangeImpact = {
  /** People who owe the fee and have already paid something toward it. */
  payerCount: number
  /**
   * People who will owe more than they do now, how much more in total, and
   * how many of them have already paid something.
   */
  moreOwed: { people: number; total: number; alreadyPaid: number }
  /** People who will have paid more than they owe, beyond what they do now. */
  newlyOverpaid: { people: number; total: number }
}

const keyOf = (a: FeeAccount) => `${a.targetType}:${a.targetId}`
const roundCents = (amount: number) => Math.round(amount * 100) / 100

/**
 * Compares a group's fee accounts priced at its current fees (`before`, empty
 * when the group isn't tracked yet) against the proposed fees (`after`).
 */
export function describeFeeChangeImpact(
  before: FeeAccount[],
  after: FeeAccount[]
): FeeChangeImpact {
  const beforeByKey = new Map(before.map((a) => [keyOf(a), a]))
  const impact: FeeChangeImpact = {
    payerCount: 0,
    moreOwed: { people: 0, total: 0, alreadyPaid: 0 },
    newlyOverpaid: { people: 0, total: 0 },
  }

  for (const account of after) {
    const previous = beforeByKey.get(keyOf(account))
    if (account.standing === 'owes' && account.coveredSoFar > 0) {
      impact.payerCount++
    }

    const owedIncrease = account.amountDue - (previous?.amountDue ?? 0)
    if (owedIncrease > 0) {
      impact.moreOwed.people++
      impact.moreOwed.total += owedIncrease
      if (account.coveredSoFar > 0) impact.moreOwed.alreadyPaid++
    }

    const overIncrease = account.amountOver - (previous?.amountOver ?? 0)
    if (overIncrease > 0) {
      impact.newlyOverpaid.people++
      impact.newlyOverpaid.total += overIncrease
    }
  }

  impact.moreOwed.total = roundCents(impact.moreOwed.total)
  impact.newlyOverpaid.total = roundCents(impact.newlyOverpaid.total)
  return impact
}
