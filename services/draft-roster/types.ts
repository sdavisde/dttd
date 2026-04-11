import type { Tables } from '@/database.types'

/**
 * Raw draft roster record from the database.
 */
export type RawDraftRosterRecord = Tables<'draft_weekend_roster'>

/**
 * Draft roster record with joined user data for display.
 */
export type DraftRosterMember = {
  id: string
  weekendId: string
  userId: string
  chaRole: string
  rollo: string | null
  createdBy: string
  createdAt: string | null
  finalizedAt: string | null
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    phoneNumber: string | null
  }
}

/**
 * Raw shape returned from the draft roster query with user join.
 */
export type RawDraftRosterWithUser = {
  id: string
  weekend_id: string
  user_id: string
  cha_role: string
  rollo: string | null
  created_by: string
  created_at: string | null
  finalized_at: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
}
