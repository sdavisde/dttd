// The shapes of a calculated fee. Outstanding fees are calculated, never
// stored — see ./fee-balances for the calculation.

/** Someone a tracked weekend group may expect a fee from. */
export type FeePerson = {
  /** Where a payment for this person should be recorded. */
  targetType: 'candidate' | 'weekend_group_member' | 'weekend_roster'
  targetId: string
  /**
   * Other target IDs whose payments also count for this person — a team
   * member's roster rows, which older payments were recorded against.
   */
  legacyTargetIds: string[]
  name: string | null
  /** Who is expected to pay: the team member, or the candidate's sponsor. */
  expectedPayer: string | null
  /**
   * The CHA role this person serves in on `weekendId`. Null for candidates,
   * and for a team member whose roster row carries no role.
   */
  chaRole: string | null
  weekendId: string | null
  weekendNumber: number | null
  weekendType: 'MENS' | 'WOMENS' | null
}

export type OutstandingFee = FeePerson & {
  /** The fee this person owes in full (cash price); 0 when they owe nothing. */
  feeAmount: number
  /** Live payments already on record for them, waived fees included. */
  coveredSoFar: number
  /** What is still owed; greater than zero on the outstanding list. */
  amountDue: number
}
