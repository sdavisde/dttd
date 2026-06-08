import { isNil } from 'lodash'
import { createClient } from '@/lib/supabase/client'
import { createUploadUrlAction } from '@/services/files/actions'
import { logger } from '@/lib/logger'
import { getFriendlyUploadError } from '@/lib/files/upload-errors'
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
 *
 * This never throws: every failure is logged with its raw cause and returned as
 * a specific, user-facing message so callers can show it directly.
 */
export async function uploadFileToStorage({
  folder,
  file,
}: {
  folder: string
  file: File
}): Promise<Result<string, { fileName: string }>> {
  try {
    const grant = await createUploadUrlAction({ folder, fileName: file.name })
    if (isErr(grant)) {
      logger.error(
        { error: grant.error, folder, fileName: file.name },
        'Failed to create signed upload URL'
      )
      return err(getFriendlyUploadError(grant.error))
    }

    const supabase = createClient()
    const { error } = await supabase.storage
      .from(grant.data.bucket)
      .uploadToSignedUrl(grant.data.path, grant.data.token, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!isNil(error)) {
      logger.error(
        { error, folder, fileName: file.name },
        'Upload to Supabase Storage failed'
      )
      return err(getFriendlyUploadError(error))
    }

    return ok({ fileName: file.name })
  } catch (error) {
    logger.error(
      { error, folder, fileName: file.name },
      'Unexpected error while uploading file'
    )
    return err(getFriendlyUploadError(error))
  }
}
