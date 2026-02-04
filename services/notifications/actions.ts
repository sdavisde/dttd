'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import * as NotificationService from './notification-service'
import { Permission } from '@/lib/security'
import { ContactInfo } from './types'

// ============================================================================
// Authorized Actions (Require User Session)
// ============================================================================

/**
 * Get contact information by ID.
 * Requires READ_ADMIN_PORTAL permission.
 */
export const getContactInformation = authorizedAction<string, ContactInfo>(
  Permission.READ_ADMIN_PORTAL,
  async (contactId) => {
    return await NotificationService.getContactInformation(contactId)
  }
)

type UpdateContactInformationRequest = {
  contactId: string
  emailAddress: string
}

/**
 * Update contact information email address.
 * Requires WRITE_USER_ROLES permission (board members can update).
 */
export const updateContactInformation = authorizedAction<
  UpdateContactInformationRequest,
  ContactInfo
>(Permission.WRITE_USER_ROLES, async ({ contactId, emailAddress }) => {
  return await NotificationService.updateContactInformation(
    contactId,
    emailAddress
  )
})

// ============================================================================
// Admin Actions (For Server-to-Server Use, e.g., Webhooks)
// These functions bypass auth because they're called from contexts
// with their own authentication (e.g., Stripe webhook signature verification)
// ============================================================================

/**
 * Notifies the pre-weekend couple when a candidate payment is received.
 * Uses admin client - for use in webhook contexts where there is no user session.
 */
export async function notifyCandidatePaymentReceivedAdmin(
  candidateId: string,
  paymentAmount: number,
  paymentMethod: 'card' | 'cash' | 'check'
) {
  return NotificationService.notifyCandidatePaymentReceivedAdmin(
    candidateId,
    paymentAmount,
    paymentMethod
  )
}

/**
 * Gets the pre-weekend couple's email address.
 * Uses regular client (requires user session).
 */
export async function getPreWeekendCoupleEmail() {
  return NotificationService.getPreWeekendCoupleEmail()
}
