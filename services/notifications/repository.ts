import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { err, ok, Result } from '@/lib/results'
import { Tables } from '@/database.types'

export async function getContactInformation(
  contactId: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_information')
    .select('*')
    .eq('id', contactId)
    .single()

  if (error) {
    return err(`Failed to fetch contact information: ${error.message}`)
  }

  if (!data) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}

/**
 * Admin version for use in webhook contexts where there is no user session.
 * Bypasses RLS policies.
 */
export async function getContactInformationAdmin(
  contactId: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('contact_information')
    .select('*')
    .eq('id', contactId)
    .single()

  if (error) {
    return err(`Failed to fetch contact information: ${error.message}`)
  }

  if (!data) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}

export async function updateContactInformation(
  contactId: string,
  emailAddress: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_information')
    .update({ email_address: emailAddress })
    .eq('id', contactId)
    .select()
    .single()

  if (error) {
    return err(`Failed to update contact information: ${error.message}`)
  }

  if (!data) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}
