import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { Result, ok, err } from '@/lib/results'
import { Tables } from '@/database.types'

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

  if (error) {
    return err(error.message)
  }

  return ok(data)
}

export async function getSettingsByKeys(
  keys: string[]
): Promise<Result<string, RawSiteSetting[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', keys)

  if (error) {
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

  if (error) {
    return err(error.message)
  }

  return ok(data)
}
