import {
  computeActiveWeekendFinancials,
  computeGrandTotals,
  computePaymentTotals,
  computeWeekendReport,
} from './compute-totals'
import { makePayment } from './test-fixtures'

const stripePayment = makePayment({
  id: 'stripe-1',
  payment_method: 'stripe',
  payment_intent_id: 'pi_1',
  gross_amount: 195,
  net_amount: 189.04,
  stripe_fee: 5.96,
  target_id: 'candidate-2',
})
const cashPayment = makePayment({ id: 'cash-1' })
const waivedPayment = makePayment({
  id: 'waived-1',
  payment_method: 'waived',
  target_id: 'candidate-3',
  payment_owner: 'DTTD Community',
})

describe('computePaymentTotals', () => {
  it('keeps waived fees out of every money figure', () => {
    const totals = computePaymentTotals([
      stripePayment,
      cashPayment,
      waivedPayment,
    ])

    expect(totals.count).toBe(2)
    expect(totals.gross).toBe(380)
    expect(totals.net).toBeCloseTo(374.04)
    expect(totals.fees).toBeCloseTo(5.96)
    expect(totals.candidateGross).toBe(380)
  })

  it('tallies waived fees on their own', () => {
    const totals = computePaymentTotals([cashPayment, waivedPayment])
    expect(totals.waivedCount).toBe(1)
    expect(totals.waivedTotal).toBe(185)
  })
})

describe('computeWeekendReport', () => {
  it('excludes waived rows from gross, net, counts and the offline split', () => {
    const [group] = computeWeekendReport([
      stripePayment,
      cashPayment,
      waivedPayment,
    ])
    const [mens] = group.weekends

    expect(mens.totalGross).toBe(380)
    expect(mens.totalCount).toBe(2)
    expect(mens.candidateCount).toBe(2)
    expect(mens.offlineGross).toBe(185)
    expect(mens.onlineGross).toBe(195)
    expect(mens.totalFees).toBeCloseTo(5.96)
    expect(mens.waivedTotal).toBe(185)
    expect(mens.waivedCount).toBe(1)
  })

  it('carries waived totals into the grand totals without adding them to gross', () => {
    const totals = computeGrandTotals(
      computeWeekendReport([cashPayment, waivedPayment])
    )
    expect(totals.totalGross).toBe(185)
    expect(totals.waivedTotal).toBe(185)
    expect(totals.waivedCount).toBe(1)
  })
})

describe('computeActiveWeekendFinancials', () => {
  const weekendIds = { MENS: 'weekend-mens', WOMENS: 'weekend-womens' }
  const candidateIds = new Set(['candidate-1', 'candidate-2', 'candidate-3'])

  const run = (payments: Parameters<typeof computePaymentTotals>[0]) =>
    computeActiveWeekendFinancials(
      payments,
      weekendIds,
      {},
      { 'weekend-mens': 3 },
      185,
      185,
      new Set(),
      candidateIds
    )

  it('treats a waived fee as covered: paid count up, nothing left to collect', () => {
    const financials = run([cashPayment, waivedPayment])
    const mens = financials.weekends[0]

    expect(mens.candidatePaidCount).toBe(2)
    // 3 candidates x $185, less the one fee the community covered.
    expect(mens.candidateExpectedTotal).toBe(370)
    // Only the cash counts as received.
    expect(mens.candidateReceivedTotal).toBe(185)
    expect(mens.candidateWaivedTotal).toBe(185)
    expect(financials.overallWaivedTotal).toBe(185)
    // One candidate still owes exactly one fee.
    expect(
      financials.overallExpectedTotal - financials.overallReceivedTotal
    ).toBe(185)
  })

  it('never lets a duplicate or oversized waiver cover more than one fee', () => {
    const financials = run([
      waivedPayment,
      makePayment({
        id: 'waived-2',
        payment_method: 'waived',
        target_id: 'candidate-3',
        gross_amount: 500,
      }),
    ])
    expect(financials.weekends[0].candidateWaivedTotal).toBe(185)
    expect(financials.weekends[0].candidateExpectedTotal).toBe(370)
  })

  it('ignores a waiver for someone no longer active when reducing expected', () => {
    const financials = run([
      makePayment({
        id: 'waived-gone',
        payment_method: 'waived',
        target_id: 'candidate-rejected',
      }),
    ])
    expect(financials.weekends[0].candidateExpectedTotal).toBe(555)
    expect(financials.weekends[0].candidateReceivedTotal).toBe(0)
  })

  it('leaves Stripe-only math untouched', () => {
    const financials = run([stripePayment])
    expect(financials.weekends[0].candidateReceivedTotal).toBe(195)
    expect(financials.weekends[0].candidateExpectedTotal).toBe(555)
    expect(financials.weekends[0].candidateWaivedTotal).toBe(0)
  })
})
