/**
 * Weekend Service Types
 *
 * Types specific to the weekend service layer.
 * Most weekend types are defined in lib/weekend/types.ts and re-exported from index.ts.
 */

import type { Tables } from '@/database.types'
import type { PaymentSummary } from '@/lib/payments/utils'

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
  special_needs: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
    church_affiliation: string | null
    profile_photo_path: string | null
    profile_photo_updated_at: string | null
  } | null
  /** Payments fetched from payment_transaction table */
  payments: PaymentRecord[]
  /** Whether all required team forms are complete (fetched via group-member service) */
  forms_complete: boolean
}

/**
 * Read-only summary of a team member's info sheet submission.
 * Excludes medical information (shown separately via the medical column).
 */
export type TeamFormSummary = {
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    zip: string
  } | null
  churchAffiliation: string | null
  weekendAttended: string | null
  essentialsTrainingDate: string | null
  specialGiftsAndSkills: string[] | null
  experience: Array<{
    chaRole: string
    weekendReference: string
    rollo: string | null
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
  special_needs: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
    church_affiliation: string | null
    profile_photo_path: string | null
    profile_photo_updated_at: string | null
  } | null
  /** The shared weekend_group_member ID for this roster member */
  groupMemberId: string | null
  /** First payment record (for backward compatibility) */
  payment_info: PaymentRecord | null
  /** Total amount paid from all payment records */
  total_paid: number
  /** Array of all payment records for this member */
  all_payments: PaymentRecord[]
  /** Pre-computed payment summary (fee from Stripe, discount-aware) */
  paymentSummary: PaymentSummary
  /** Whether all 5 team forms have been completed */
  forms_complete: boolean
  /** Medical profile from user_medical_profiles (populated when permission is granted) */
  medical_profile: {
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    medical_conditions: string | null
  } | null
  /**
   * Info sheet summary (populated only for viewers with READ_TEAM_FORM_INFO
   * and only for members whose forms are complete)
   */
  team_form_summary: TeamFormSummary | null
}

/**
 * Payload for creating/updating weekend groups from the sidebar UI.
 */
export type WeekendSidebarPayload = {
  groupId?: string | null
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
