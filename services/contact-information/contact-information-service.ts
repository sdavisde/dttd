import 'server-only'

import { Result } from '@/lib/results'
import { Tables } from '@/lib/supabase/database.types'
import * as ContactInformationRepository from './repository'

export async function getContactInformation(
  contactId: string
): Promise<Result<string, Tables<'contact_information'>>> {
  return await ContactInformationRepository.getContactInformation(contactId)
}

export async function updateContactInformation(
  contactId: string,
  emailAddress: string
): Promise<Result<string, Tables<'contact_information'>>> {
  return await ContactInformationRepository.updateContactInformation(
    contactId,
    emailAddress
  )
}
