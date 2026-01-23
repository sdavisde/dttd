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
