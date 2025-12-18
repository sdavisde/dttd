'use server'

import * as CandidateService from './candidate-service'

export const getCandidateById = async (candidateId: string) => {
  return await CandidateService.getCandidateById(candidateId)
}

export const getAllCandidates = async () => {
  return await CandidateService.getAllCandidates()
}
