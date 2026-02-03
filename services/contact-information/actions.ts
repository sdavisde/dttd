'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import * as ContactInformationService from './contact-information-service'
import { Permission } from '@/lib/security'
import { Tables } from '@/database.types'

/**
 * Get contact information by ID.
 * Requires READ_ADMIN_PORTAL permission.
 */
export const getContactInformation = authorizedAction<
  string,
  Tables<'contact_information'>
>(Permission.READ_ADMIN_PORTAL, async (contactId) => {
  return await ContactInformationService.getContactInformation(contactId)
})

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
  Tables<'contact_information'>
>(Permission.WRITE_USER_ROLES, async ({ contactId, emailAddress }) => {
  return await ContactInformationService.updateContactInformation(
    contactId,
    emailAddress
  )
})
