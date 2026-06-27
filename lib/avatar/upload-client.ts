import { isNil } from 'lodash'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { getFriendlyUploadError } from '@/lib/files/upload-errors'
import { AVATAR_BUCKET } from '@/lib/avatar/avatar-url'
import { err, ok, type Result } from '@/lib/results'

/** Storage path for a user's avatar. RLS ties writes to this exact name. */
export function avatarPath(userId: string): string {
  return `${userId}.webp`
}

/**
 * Uploads a cropped WebP avatar straight from the browser to
 * `avatars/{userId}.webp`, overwriting any previous photo. Avatars are tiny
 * (~30KB) so the direct authenticated upload is preferred over the signed-URL
 * flow used for large admin documents. RLS guarantees a user can only write
 * their own path. Never throws — failures come back as a friendly message.
 */
export async function uploadAvatar(
  userId: string,
  blob: Blob
): Promise<Result<string, { path: string }>> {
  const path = avatarPath(userId)
  try {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, blob, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: '3600',
      })

    if (!isNil(error)) {
      logger.error({ error, userId }, 'Avatar upload failed')
      return err(getFriendlyUploadError(error))
    }

    return ok({ path })
  } catch (error) {
    logger.error({ error, userId }, 'Unexpected error uploading avatar')
    return err(getFriendlyUploadError(error))
  }
}

/**
 * Deletes a user's avatar object from storage. Used by the "Remove photo" flow
 * before clearing the database columns.
 */
export async function deleteAvatar(
  userId: string
): Promise<Result<string, null>> {
  const path = avatarPath(userId)
  try {
    const supabase = createClient()
    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path])

    if (!isNil(error)) {
      logger.error({ error, userId }, 'Avatar delete failed')
      return err(getFriendlyUploadError(error))
    }

    return ok(null)
  } catch (error) {
    logger.error({ error, userId }, 'Unexpected error deleting avatar')
    return err(getFriendlyUploadError(error))
  }
}
