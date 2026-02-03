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
