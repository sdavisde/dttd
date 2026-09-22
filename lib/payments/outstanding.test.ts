import { deriveOutstandingFees, type FeePerson } from './outstanding'
import { makePayment } from './test-fixtures'

const prices = { teamFee: 195, candidateFee: 195 }

const candidate = (id: string, name: string): FeePerson => ({
  targetType: 'candidate',
  targetId: id,
  legacyTargetIds: [],
  name,
  expectedPayer: 'Tom Bailey',
  chaRole: null,
  weekendId: 'weekend-mens',
  weekendNumber: 12,
  weekendType: 'MENS',
})

const teamMember: FeePerson = {
  targetType: 'weekend_group_member',
  targetId: 'member-1',
  legacyTargetIds: ['roster-1'],
  name: 'Ann Simmons',
  expectedPayer: 'Ann Simmons',
  chaRole: 'Rover',
  weekendId: 'weekend-womens',
  weekendNumber: 12,
  weekendType: 'WOMENS',
}

describe('deriveOutstandingFees', () => {
  it('lists someone with no payment as owing the cash price', () => {
    const [fee] = deriveOutstandingFees(
      [candidate('candidate-9', 'Luis Moreno')],
      [],
      prices
    )
    expect(fee.amountDue).toBe(185)
    expect(fee.feeAmount).toBe(185)
    expect(fee.coveredSoFar).toBe(0)
  })

  it('settles someone who paid cash or the higher online price', () => {
    const people = [
      candidate('candidate-1', 'David Park'),
      candidate('candidate-2', 'Robert Chen'),
    ]
    const payments = [
      makePayment({ target_id: 'candidate-1', gross_amount: 185 }),
      makePayment({
        id: 'p2',
        target_id: 'candidate-2',
        gross_amount: 195,
        payment_method: 'stripe',
      }),
    ]
    expect(deriveOutstandingFees(people, payments, prices)).toEqual([])
  })

  it('treats a waived fee as covered, not unpaid', () => {
    const payments = [
      makePayment({ target_id: 'candidate-1', payment_method: 'waived' }),
    ]
    expect(
      deriveOutstandingFees(
        [candidate('candidate-1', 'Sam Whitfield')],
        payments,
        prices
      )
    ).toEqual([])
  })

  it('never counts a voided payment', () => {
    const payments = [
      makePayment({
        target_id: 'candidate-1',
        voided_at: '2026-09-01T00:00:00.000Z',
      }),
    ]
    const [fee] = deriveOutstandingFees(
      [candidate('candidate-1', 'David Park')],
      payments,
      prices
    )
    expect(fee.amountDue).toBe(185)
  })

  it('shows only the balance after a partial payment', () => {
    const payments = [
      makePayment({ target_id: 'candidate-1', gross_amount: 100 }),
    ]
    const [fee] = deriveOutstandingFees(
      [candidate('candidate-1', 'David Park')],
      payments,
      prices
    )
    expect(fee.coveredSoFar).toBe(100)
    expect(fee.amountDue).toBe(85)
  })

  it('counts older payments recorded against a roster row', () => {
    const payments = [
      makePayment({
        target_type: 'weekend_roster',
        target_id: 'roster-1',
        gross_amount: 185,
      }),
    ]
    expect(deriveOutstandingFees([teamMember], payments, prices)).toEqual([])
  })

  it('carries the CHA role through to the fee', () => {
    const [fee] = deriveOutstandingFees([teamMember], [], prices)
    expect(fee.chaRole).toBe('Rover')
  })

  it('uses the team price for team members', () => {
    const [fee] = deriveOutstandingFees([teamMember], [], {
      teamFee: 110,
      candidateFee: 195,
    })
    expect(fee.amountDue).toBe(100)
  })
})
