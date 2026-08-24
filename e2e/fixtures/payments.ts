import { test as base } from '@playwright/test'
import { adminClient } from './supabase'

/** A candidate that can be the subject or destination of a test payment. */
export type TestCandidate = {
  id: string
  name: string
  weekendId: string
}

export type TestPayment = {
  id: string
  /** Unique string written to notes, used to find this row in the UI. */
  marker: string
  grossAmount: number
  paidBy: string
  /** The candidate the payment starts out assigned to. */
  candidate: TestCandidate
  /** A candidate on a *different* weekend, for reassign assertions. */
  otherCandidate: TestCandidate
}

/**
 * Finds two seeded candidates on different weekends.
 *
 * Reassign has to move `weekend_id` along with the target; that is only
 * observable if the two candidates belong to different weekends, so the
 * fixture insists on it rather than picking arbitrary rows.
 */
async function findCandidatePair(): Promise<[TestCandidate, TestCandidate]> {
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('candidates')
    .select('id, weekend_id, candidate_sponsorship_info(candidate_name)')
    .not('weekend_id', 'is', null)

  if (error !== null) {
    throw new Error(`Failed to load candidates: ${error.message}`)
  }

  const named = (data ?? []).flatMap((row) => {
    const name = row.candidate_sponsorship_info.at(0)?.candidate_name
    if (name === undefined || name === null || row.weekend_id === null) {
      return []
    }
    return [{ id: row.id, name, weekendId: row.weekend_id }]
  })

  const first = named.at(0)
  if (first === undefined) {
    throw new Error(
      'No seeded candidates with names found — run `yarn db:reset` first'
    )
  }

  const other = named.find((c) => c.weekendId !== first.weekendId)
  if (other === undefined) {
    throw new Error(
      'Seed data has no two candidates on different weekends, which the reassign tests need'
    )
  }

  return [first, other]
}

/**
 * Creates a payment row for one test and removes it afterwards.
 *
 * Tests mutate the payment they are given, so each gets its own row rather
 * than sharing a seeded one — otherwise a voided or reassigned payment would
 * leak into the next run.
 */
export const test = base.extend<{ testPayment: TestPayment }>({
  testPayment: async ({}, use) => {
    const supabase = adminClient()
    const [candidate, otherCandidate] = await findCandidatePair()

    const marker = `e2e-${crypto.randomUUID()}`
    const grossAmount = 123.45
    const paidBy = `E2E Sponsor ${marker.slice(4, 12)}`

    const { data, error } = await supabase
      .from('payment_transaction')
      .insert({
        type: 'fee',
        target_type: 'candidate',
        target_id: candidate.id,
        weekend_id: candidate.weekendId,
        payment_intent_id: `manual_${marker}`,
        gross_amount: grossAmount,
        payment_method: 'check',
        payment_owner: paidBy,
        notes: marker,
      })
      .select()
      .single()

    if (error !== null || data === null) {
      throw new Error(`Failed to create test payment: ${error?.message}`)
    }

    await use({
      id: data.id,
      marker,
      grossAmount,
      paidBy,
      candidate,
      otherCandidate,
    })

    await supabase.from('payment_transaction').delete().eq('id', data.id)
  },
})

export { expect } from '@playwright/test'
