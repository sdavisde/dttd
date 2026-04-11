import { isNil } from 'lodash'
import { CHARole } from '@/lib/weekend/types'
import type { EligibilityResult } from './types'

/**
 * Context provided to eligibility check functions.
 */
type EligibilityContext = {
  hasBeenSectionHead: boolean
  hasGivenRollo: boolean
  rectorReadyIsReady: boolean
}

/**
 * Eligibility check function signature.
 * Returns whether a member is eligible for a role, with an optional reason if not.
 */
type EligibilityCheck = (context: EligibilityContext) => EligibilityResult

/**
 * Extendable registry of eligibility checks per CHA role.
 * Only roles with special requirements need entries here.
 * To add a new eligibility rule, add a new entry to this map.
 */
const ELIGIBILITY_CHECKS: Partial<Record<CHARole, EligibilityCheck>> = {
  [CHARole.HEAD]: (ctx) => {
    if (!ctx.hasBeenSectionHead || !ctx.hasGivenRollo) {
      const missing: string[] = []
      if (!ctx.hasBeenSectionHead) missing.push('section head experience')
      if (!ctx.hasGivenRollo) missing.push('rollo experience')
      return {
        eligible: false,
        reason: `Needs ${missing.join(' and ')}`,
      }
    }
    return { eligible: true }
  },

  [CHARole.ASSISTANT_HEAD]: (ctx) => {
    if (!ctx.hasBeenSectionHead || !ctx.hasGivenRollo) {
      const missing: string[] = []
      if (!ctx.hasBeenSectionHead) missing.push('section head experience')
      if (!ctx.hasGivenRollo) missing.push('rollo experience')
      return {
        eligible: false,
        reason: `Needs ${missing.join(' and ')}`,
      }
    }
    return { eligible: true }
  },

  [CHARole.ROVER]: (ctx) => {
    if (!ctx.rectorReadyIsReady) {
      return {
        eligible: false,
        reason: 'Not rector ready',
      }
    }
    return { eligible: true }
  },
}

/**
 * Computes eligibility for all roles that have special requirements.
 * Returns a map of role string → EligibilityResult.
 */
export function computeEligibility(
  context: EligibilityContext
): Record<string, EligibilityResult> {
  const result: Record<string, EligibilityResult> = {}

  for (const [role, check] of Object.entries(ELIGIBILITY_CHECKS)) {
    if (!isNil(check)) {
      result[role] = check(context)
    }
  }

  return result
}

/**
 * Returns the list of roles that have eligibility requirements.
 * Useful for UI to know which roles need eligibility indicators.
 */
export function getRolesWithEligibilityChecks(): string[] {
  return Object.keys(ELIGIBILITY_CHECKS)
}
