import { isNil } from 'lodash'

/** Storage bucket that holds user avatars (see migration 20260627000000). */
export const AVATAR_BUCKET = 'avatars'

/**
 * Converts `profile_photo_updated_at` into a cache-busting version token.
 * Returns null for nil/invalid timestamps so the URL is left un-versioned.
 */
function toVersion(updatedAt?: string | null): number | null {
  if (isNil(updatedAt)) {
    return null
  }
  const epoch = new Date(updatedAt).getTime()
  return Number.isNaN(epoch) ? null : epoch
}

/**
 * Builds the public Supabase CDN URL for a stored avatar.
 *
 * Returns null when no path is set (callers render the initials fallback) or when
 * the Supabase URL env var is missing. A `?v=<epoch>` cache-buster derived from
 * `profile_photo_updated_at` is appended so a replaced photo is fetched fresh
 * instead of being served from a stale CDN/browser cache.
 *
 * Uses a plain public-object URL (not Supabase Image Transformations or Next.js
 * `<Image>`) to keep avatars free to serve.
 */
export function getAvatarUrl(
  profilePhotoPath?: string | null,
  profilePhotoUpdatedAt?: string | null
): string | null {
  if (isNil(profilePhotoPath) || profilePhotoPath === '') {
    return null
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (isNil(baseUrl)) {
    return null
  }

  const publicUrl = `${baseUrl}/storage/v1/object/public/${AVATAR_BUCKET}/${profilePhotoPath}`
  const version = toVersion(profilePhotoUpdatedAt)
  return isNil(version) ? publicUrl : `${publicUrl}?v=${version}`
}
