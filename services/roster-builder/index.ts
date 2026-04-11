/**
 * Roster Builder Service
 *
 * Public API for the roster builder feature — community data with eligibility,
 * draft roster management, and finalization.
 */

// Actions
export {
  // Community data
  getRosterBuilderCommunityData,
  // Draft roster
  addDraftRosterMember,
  getDraftRoster,
  removeDraftRosterMember,
  finalizeDraftRosterMember,
  // Finalized roster
  dropFinalizedRosterMember,
  removeFinalizedRosterMember,
} from './actions'

// Types
export type {
  RosterBuilderCommunityMember,
  AssignmentStatus,
  EligibilityResult,
  DraftRosterMember,
} from './types'

// Eligibility utilities
export { getRolesWithEligibilityChecks } from './eligibility'
