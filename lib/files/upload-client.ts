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
 * the Server Action / platform request body-size limit.
 *
 * Note: `uploadToSignedUrl` cannot carry custom object metadata (the SDK drops
 * it), so any per-file metadata must be persisted separately — see
 * `saveMeetingMinutesLocationAction`.
 */
export async function uploadFileToStorage({
  folder,
  file,
}: {
  folder: string
  file: File
}): Promise<Result<string, { fileName: string }>> {
  const grant = await createUploadUrlAction({ folder, fileName: file.name })
  if (isErr(grant)) return grant

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(grant.data.bucket)
    .uploadToSignedUrl(grant.data.path, grant.data.token, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (!isNil(error)) return err(error.message)

  return ok({ fileName: file.name })
}
