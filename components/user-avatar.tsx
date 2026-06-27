import { isNil } from 'lodash'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar/avatar-url'
import { getAvatarColor, getInitials } from '@/lib/avatar/initials'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/users/types'

/**
 * Minimal user shape `UserAvatar` needs. Most surfaces work with raw,
 * snake_case database rows, so this is the canonical shape; use
 * {@link avatarUserFromDto} to adapt the camelCase `User` DTO.
 */
export type UserAvatarUser = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  profile_photo_path?: string | null
  profile_photo_updated_at?: string | null
}

type UserAvatarProps = {
  user: UserAvatarUser
  /** Rendered diameter in pixels. Defaults to 36 (navbar/table size). */
  size?: number
  className?: string
}

/**
 * Shared avatar used everywhere a user is rendered: shows the CDN photo when a
 * path exists, otherwise a deterministic-colored initials fallback. Renders a
 * plain `<img>` (via shadcn `AvatarImage`) so avatars never hit the Vercel image
 * optimizer.
 */
export function UserAvatar({ user, size = 36, className }: UserAvatarProps) {
  const imageUrl = getAvatarUrl(
    user.profile_photo_path,
    user.profile_photo_updated_at
  )
  const initials = getInitials(user)
  const colorClass = getAvatarColor(user.id)
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const name = fullName !== '' ? fullName : (user.email ?? 'User')

  return (
    <Avatar
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {!isNil(imageUrl) && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback
        className={cn(colorClass, 'font-medium text-white')}
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

/** Adapts the camelCase `User` DTO into the snake_case shape `UserAvatar` expects. */
export function avatarUserFromDto(
  user: Pick<
    User,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'profilePhotoPath'
    | 'profilePhotoUpdatedAt'
  >
): UserAvatarUser {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    profile_photo_path: user.profilePhotoPath,
    profile_photo_updated_at: user.profilePhotoUpdatedAt,
  }
}
