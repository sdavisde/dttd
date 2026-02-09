/**
 * Weekend Service Types
 *
 * Types specific to the weekend service layer.
 * Most weekend types are defined in lib/weekend/types.ts and re-exported from index.ts.
 */

import { Tables } from '@/database.types'

/**
 * Payment record from the payment_transaction table.
 */
export type PaymentRecord = Tables<'payment_transaction'>

/**
 * Raw weekend roster record shape from Supabase query with joins.
 * Used internally by the repository layer.
 *
 * Note: Payments are fetched separately via PaymentService since payment_transaction
 * uses a polymorphic target_id without FK constraints.
 */
export type RawWeekendRoster = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  completed_statement_of_belief_at: string | null
  completed_commitment_form_at: string | null
  completed_release_of_claim_at: string | null
  completed_camp_waiver_at: string | null
  completed_info_sheet_at: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_conditions: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
  /** Payments fetched from payment_transaction table */
  payments: PaymentRecord[]
}

/**
 * Normalized weekend roster member with computed fields.
 * Returned by the service layer after processing raw data.
 */
export type WeekendRosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
  /** First payment record (for backward compatibility) */
  payment_info: PaymentRecord | null
  /** Total amount paid from all payment records */
  total_paid: number
  /** Array of all payment records for this member */
  all_payments: PaymentRecord[]
  /** Whether all 5 team forms have been completed */
  forms_complete: boolean
  /** Emergency contact name */
  emergency_contact_name: string | null
  /** Emergency contact phone */
  emergency_contact_phone: string | null
  /** Medical conditions */
  medical_conditions: string | null
}

/**
 * Payload for creating/updating weekend groups from the sidebar UI.
 */
export type WeekendSidebarPayload = {
  groupId?: string | null
  title?: string
  mensStart: string
  mensEnd: string
  womensStart: string
  womensEnd: string
}

/**
 * Leadership team member for the leadership preview component.
 */
export type LeadershipTeamMember = {
  id: string
  fullName: string
  chaRole: string
}

/**
 * Leadership team data grouped by gender.
 */
export type LeadershipTeamData = {
  menLeaders: LeadershipTeamMember[]
  womenLeaders: LeadershipTeamMember[]
}
