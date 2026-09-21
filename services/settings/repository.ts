import 'server-only'

import { isNil } from 'lodash'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { ok, err } from '@/lib/results'
import type { Tables } from '@/database.types'

type RawSiteSetting = Tables<'site_settings'>

export async function getSettingByKey(
  key: string
): Promise<Result<string, RawSiteSetting | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', key)
    .maybeSingle()

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok(data)
}

/**
 * Admin-client read for settings the server itself needs regardless of who (if
 * anyone) is logged in — the system `from:` address and the notification
 * toggles are both consulted from Stripe webhooks and anonymous public form
 * submissions, where the RLS `authenticated` read policy does not apply.
 *
 * Never throws: a missing service-role key resolves to an error Result so the
 * caller can fall back to the session client or to the built-in default.
 */
export async function getSettingByKeyAdmin(
  key: string
): Promise<Result<string, RawSiteSetting | null>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle()

    if (!isNil(error)) {
      return err(error.message)
    }

    return ok(data)
  } catch (error) {
    return err(error instanceof Error ? error.message : String(error))
  }
}

export async function getSettingsByKeys(
  keys: string[]
): Promise<Result<string, RawSiteSetting[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', keys)

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

export async function upsertSetting(
  key: string,
  value: string,
  userId: string
): Promise<Result<string, RawSiteSetting>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key,
      value,
      updated_by_user_id: userId,
    })
    .select()
    .single()

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok(data as RawSiteSetting)
}
