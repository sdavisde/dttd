'use server'

import type { Result} from '@/lib/results';
import { err, ok } from '@/lib/results'
import { createClient } from '@/lib/supabase/server'
import { isNil } from 'lodash'

export async function deleteFolder(
  bucketName: string,
  folderName: string
): Promise<Result<string, Array<string>>> {
  const supabase = await createClient()

  const { data: list, error: listError } = await supabase.storage
    .from(bucketName)
    .list(folderName)
  const filesToRemove = list?.map((it) => `${folderName}/${it.name}`)
  if (isNil(filesToRemove)) {
    return err('No files to remove')
  }

  const { error: removeError } = await supabase.storage
    .from(bucketName)
    .remove(filesToRemove)

  if (!isNil(listError) || !isNil(removeError)) {
    return err(listError?.message ?? removeError?.message ?? 'Unknown error')
  }
  return ok(filesToRemove)
}
