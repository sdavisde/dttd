import { isNil } from 'lodash'

export type InitialsInput = {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

/**
 * Derives up to two uppercase initials for the avatar fallback.
 *
 * Prefers first + last initials; falls back to the first email character when
 * names are missing; returns '?' when nothing usable is present.
 */
export function getInitials({
  first_name,
  last_name,
  email,
}: InitialsInput): string {
  const first = first_name?.trim().charAt(0) ?? ''
  const last = last_name?.trim().charAt(0) ?? ''
  const fromName = `${first}${last}`.toUpperCase()
  if (fromName !== '') {
    return fromName
  }

  const fromEmail = email?.trim().charAt(0).toUpperCase() ?? ''
  return fromEmail !== '' ? fromEmail : '?'
}

/**
 * Background color classes for the initials fallback. Chosen to read well with
 * white text. Kept as full Tailwind class strings so they survive purging.
 */
const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-600',
  'bg-green-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600',
] as const

/**
 * Maps a user id to a deterministic background color class, so the same user
 * always renders the same fallback color across surfaces.
 */
export function getAvatarColor(id?: string | null): string {
  if (isNil(id) || id === '') {
    return AVATAR_COLORS[0]
  }

  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0 // force 32-bit integer
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
