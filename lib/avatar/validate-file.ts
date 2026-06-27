import { err, ok, type Result } from '@/lib/results'

/** Image types accepted for avatar uploads (mirrors the bucket's allowed_mime_types). */
export const ACCEPTED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/** Maximum accepted source file size, matching the bucket's 5MB limit. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type AvatarFile = Pick<File, 'type' | 'size'>

/**
 * Client-side guard for the avatar file picker. This is a UX convenience — the
 * real enforcement is the bucket size limit and RLS — so the error side carries
 * a friendly, directly-displayable message. Returns a `Result` per the repo's
 * error-handling convention.
 */
export function validateAvatarFile<T extends AvatarFile>(
  file: T
): Result<string, T> {
  if (!(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return err('Please choose a JPEG, PNG, or WebP image.')
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return err('That image is larger than 5MB. Please choose a smaller file.')
  }

  return ok(file)
}
