import { isNil } from 'lodash'
import { createClient } from '@/lib/supabase/client'
import { createUploadUrlAction } from '@/services/files/actions'
import { err, isErr, ok, type Result } from '@/lib/results'

/**
 * Uploads a file to Supabase Storage using the signed-URL flow:
 *   1. Ask the server to mint a one-time upload URL + token (RBAC + extension
 *      validation enforced server-side).
 *   2. Stream the bytes directly from the browser to Supabase using that token.
 *
 * The file never passes through a Next.js Server Action, so it is not subject to
 * the Server Action / platform request body-size limit. Optional `metadata` is
 * persisted as the object's user_metadata (read back later via `.info()`).
 */
export async function uploadFileToStorage({
  folder,
  file,
  metadata,
}: {
  folder: string
  file: File
  metadata?: Record<string, string>
}): Promise<Result<string, { fileName: string }>> {
  const grant = await createUploadUrlAction({ folder, fileName: file.name })
  if (isErr(grant)) return grant

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(grant.data.bucket)
    .uploadToSignedUrl(grant.data.path, grant.data.token, file, {
      cacheControl: '3600',
      upsert: false,
      metadata,
    })

  if (!isNil(error)) return err(error.message)

  return ok({ fileName: file.name })
}
