/**
 * Weekend Service Types
 *
 * Types specific to the weekend service layer.
 * Most weekend types are defined in lib/weekend/types.ts and re-exported from index.ts.
 */

/**
 * Raw weekend roster record shape from Supabase query with joins.
 * Used internally by the repository layer.
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
    gender: string | null
  } | null
  weekend_roster_payments: Array<{
    id: string
    weekend_roster_id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
    created_at: string
    notes: string | null
  }>
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
    gender: string | null
  } | null
  payment_info: {
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
  } | null
  /** Total amount paid from all payment records */
  total_paid: number
  /** Array of all payment records for this member */
  all_payments: Array<{
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
    created_at: string
    notes: string | null
  }>
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
