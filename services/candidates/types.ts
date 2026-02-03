import { Database, Tables } from '@/database.types'
import { Address } from '@/lib/users/validation'

export type CandidateStatus = Database['public']['Enums']['candidate_status']

export type EmergencyContact = {
  name: string
  phone: string
}

export type SponsorInfo = {
  name: string
  email: string
  phone: string
  church: string
  weekend: string
}

/**
 * Normalized Candidate type for frontend consumption.
 * Aggregates data from candidates, candidate_info, candidate_sponsorship_info, and candidate_payments tables.
 */
export type Candidate = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  age: number | null
  status: CandidateStatus
  weekendId: string
  address: Address | null
  emergencyContact: EmergencyContact | null
  amountPaid: number
  paymentOwner: string
  sponsorInfo: SponsorInfo | null
}

/**
 * Shape of raw candidate data returned from the repository queries.
 */
export type RawCandidate = Tables<'candidates'> & {
  candidate_info: Array<Tables<'candidate_info'>>
  candidate_sponsorship_info: Array<Tables<'candidate_sponsorship_info'>>
  candidate_payments: Array<Tables<'candidate_payments'>>
}
