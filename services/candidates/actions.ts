'use server'

import * as CandidateService from './candidate-service'

export const getCandidateById = async (candidateId: string) => {
  return await CandidateService.getCandidateById(candidateId)
}

export const getAllCandidates = async () => {
  return await CandidateService.getAllCandidates()
}

/**
 * Records a manual (cash/check) payment for a candidate.
 * Public - no auth per user request (matches team payment pattern).
 */
export async function recordManualCandidatePayment(
  candidateId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  paymentOwner: string,
  notes?: string
) {
  return CandidateService.recordManualCandidatePayment(
    candidateId,
    paymentAmount,
    paymentMethod,
    paymentOwner,
    notes
  )
}

/**
 * Gets the count of non-rejected candidates for a specific weekend.
 */
export async function getCandidateCountByWeekend(weekendId: string) {
  return CandidateService.getCandidateCountByWeekend(weekendId)
}

/**
 * Gets the IDs of non-rejected candidates for a specific weekend.
 */
export async function getCandidateIdsByWeekend(weekendId: string) {
  return CandidateService.getCandidateIdsByWeekend(weekendId)
}

/**
 * Gets the count of candidates on a weekend awaiting a review decision.
 */
export async function getCandidateReviewCountByWeekend(weekendId: string) {
  return CandidateService.getCandidateReviewCountByWeekend(weekendId)
}

/**
 * Gets non-rejected candidate counts for several weekends, keyed by weekend id.
 */
export async function getCandidateCountsByWeekends(weekendIds: string[]) {
  return CandidateService.getCandidateCountsByWeekends(weekendIds)
}
