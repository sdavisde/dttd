import {
  deriveBoardHandItems,
  deriveCollectedThisYear,
  deriveOutstanding,
  needsPlanning,
} from './dashboard-metrics'
import {
  computeActiveWeekendFinancials,
  type ActiveWeekendFinancials,
  type ActiveWeekendMetrics,
} from '@/lib/payments/compute-totals'
import type { PaymentTransactionDTO } from '@/services/payment'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'

const NOW = new Date('2026-09-03T12:00:00Z')

function payment(
  overrides: Partial<PaymentTransactionDTO> = {}
): PaymentTransactionDTO {
  return {
    id: 'p1',
    type: 'candidate_fee',
    target_type: 'candidate',
    target_id: 'c1',
    weekend_id: null,
    payment_intent_id: null,
    gross_amount: 195,
    net_amount: null,
    stripe_fee: null,
    payment_method: 'cash',
    payment_owner: null,
    notes: null,
    charge_id: null,
    balance_transaction_id: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: null,
    voided_at: null,
    void_reason: null,
    target_name: null,
    target_email: null,
    weekend_number: 12,
    weekend_type: 'MENS',
    ...overrides,
  } as PaymentTransactionDTO
}

function weekendMetrics(
  overrides: Partial<ActiveWeekendMetrics> = {}
): ActiveWeekendMetrics {
  return {
    weekendType: 'MENS',
    weekendLabel: "Men's",
    teamExpectedCount: 0,
    teamPaidCount: 0,
    teamExpectedTotal: 0,
    teamReceivedTotal: 0,
    candidateExpectedCount: 0,
    candidatePaidCount: 0,
    candidateExpectedTotal: 0,
    candidateReceivedTotal: 0,
    candidateExtraPaymentsCount: 0,
    teamExtraPaymentsCount: 0,
    ...overrides,
  }
}

function financials(
  weekends: ActiveWeekendMetrics[],
  overrides: Partial<ActiveWeekendFinancials> = {}
): ActiveWeekendFinancials {
  return {
    weekends,
    teamExpectedTotal: 0,
    teamReceivedTotal: 0,
    candidateExpectedTotal: 0,
    candidateReceivedTotal: 0,
    overallExpectedTotal: 0,
    overallReceivedTotal: 0,
    ...overrides,
  }
}

function weekend(overrides: Partial<Weekend> = {}): Weekend {
  return {
    id: 'w1',
    start_date: '2026-10-16',
    end_date: '2026-10-19',
    number: 12,
    status: 'ACTIVE',
    title: null,
    type: 'MENS',
    groupId: 'g1',
    ...overrides,
  }
}

function group(
  mens: Partial<Weekend>,
  womens: Partial<Weekend>
): WeekendGroupWithId {
  return {
    groupId: 'g1',
    weekends: {
      MENS: weekend({ type: 'MENS', ...mens }),
      WOMENS: weekend({ id: 'w2', type: 'WOMENS', ...womens }),
    },
  }
}

describe('deriveCollectedThisYear', () => {
  it('sums gross and counts only current-year, non-voided payments', () => {
    const result = deriveCollectedThisYear(
      [
        payment({ gross_amount: 195, created_at: '2026-02-01T00:00:00Z' }),
        payment({ gross_amount: 205, created_at: '2026-08-30T00:00:00Z' }),
        payment({ gross_amount: 185, created_at: '2025-11-01T00:00:00Z' }),
        payment({
          gross_amount: 195,
          created_at: '2026-03-01T00:00:00Z',
          voided_at: '2026-03-02T00:00:00Z',
        }),
      ],
      NOW
    )
    expect(result).toEqual({ year: 2026, total: 400, count: 2 })
  })

  it('returns zeros for an empty list', () => {
    expect(deriveCollectedThisYear([], NOW)).toEqual({
      year: 2026,
      total: 0,
      count: 0,
    })
  })
})

describe('deriveOutstanding', () => {
  it('reports expected minus received and unpaid people', () => {
    const result = deriveOutstanding(
      financials(
        [
          weekendMetrics({
            teamExpectedCount: 10,
            teamPaidCount: 7,
            candidateExpectedCount: 5,
            candidatePaidCount: 2,
          }),
        ],
        { overallExpectedTotal: 2775, overallReceivedTotal: 1665 }
      )
    )
    expect(result).toEqual({ total: 1110, openFeeCount: 6 })
  })

  it('floors a surplus at zero and never counts negative unpaid people', () => {
    const result = deriveOutstanding(
      financials([weekendMetrics({ teamExpectedCount: 2, teamPaidCount: 3 })], {
        overallExpectedTotal: 370,
        overallReceivedTotal: 500,
      })
    )
    expect(result).toEqual({ total: 0, openFeeCount: 0 })
  })

  it('agrees with computeActiveWeekendFinancials, the summary-page code path', () => {
    // One roster member expected at $185 cash ($195 - $10 surcharge), nobody paid.
    const computed = computeActiveWeekendFinancials(
      [],
      { MENS: 'wm', WOMENS: 'ww' },
      { wm: 1, ww: 0 },
      { wm: 0, ww: 0 },
      195,
      195,
      new Set<string>(),
      new Set<string>()
    )
    expect(deriveOutstanding(computed)).toEqual({
      total: 185,
      openFeeCount: 1,
    })
  })
})

describe('needsPlanning', () => {
  it('is false while a weekend is still ahead', () => {
    expect(
      needsPlanning(
        [group({ start_date: '2026-10-16' }, { start_date: '2026-10-23' })],
        NOW
      )
    ).toBe(false)
  })

  it('is false while a group is in PLANNING even without future dates', () => {
    expect(
      needsPlanning(
        [
          group(
            { status: 'PLANNING', start_date: '2026-01-01' },
            { status: 'PLANNING', start_date: '2026-01-08' }
          ),
        ],
        NOW
      )
    ).toBe(false)
  })

  it('is true when every weekend is finished or in the past', () => {
    expect(
      needsPlanning(
        [
          group(
            { status: 'FINISHED', start_date: '2026-04-16' },
            { status: 'FINISHED', start_date: '2026-04-23' }
          ),
        ],
        NOW
      )
    ).toBe(true)
  })

  it('is true with no groups at all', () => {
    expect(needsPlanning([], NOW)).toBe(true)
  })
})

describe('deriveBoardHandItems', () => {
  const pastGroups = [
    group(
      { status: 'FINISHED', start_date: '2026-04-16' },
      { status: 'FINISHED', start_date: '2026-04-23' }
    ),
  ]

  it('lists open fees and start-planning when both apply', () => {
    const items = deriveBoardHandItems({
      outstanding: { total: 925, openFeeCount: 5 },
      weekendGroups: pastGroups,
      now: NOW,
    })
    expect(items).toEqual([
      {
        key: 'open-fees',
        openFeeCount: 5,
        outstandingTotal: 925,
        href: '/admin/payments',
      },
      { key: 'start-planning', href: '/admin/weekends' },
    ])
  })

  it('is empty when fees are settled and a weekend is scheduled', () => {
    expect(
      deriveBoardHandItems({
        outstanding: { total: 0, openFeeCount: 0 },
        weekendGroups: [
          group({ start_date: '2026-10-16' }, { start_date: '2026-10-23' }),
        ],
        now: NOW,
      })
    ).toEqual([])
  })

  it('contributes no item from a failed source', () => {
    expect(
      deriveBoardHandItems({
        outstanding: null,
        weekendGroups: null,
        now: NOW,
      })
    ).toEqual([])
  })
})
