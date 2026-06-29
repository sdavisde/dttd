import { isNil } from 'lodash'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getAvatarUrl } from '@/lib/avatar/avatar-url'
import { getAvatarColor, getInitials } from '@/lib/avatar/initials'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/users/types'

/**
 * Groups the two DB columns that together identify a stored profile photo.
 * Kept as an object so surfaces always carry the pairing rather than tracking
 * the two fields separately.
 */
export type ProfilePhoto = {
  path: string | null
  updatedAt: string | null
}

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
  profilePhoto: ProfilePhoto
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
    user.profilePhoto.path,
    user.profilePhoto.updatedAt
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

/**
 * Wraps `UserAvatar` in a tooltip that shows a larger preview on hover.
 * Use this on surfaces without an existing hover interaction.
 */
export function UserAvatarWithPreview({
  user,
  size = 36,
  className,
  previewSize = 160,
}: UserAvatarProps & { previewSize?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default shrink-0">
          <UserAvatar user={user} size={size} className={className} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="p-1.5 bg-popover">
        <UserAvatar user={user} size={previewSize} />
      </TooltipContent>
    </Tooltip>
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
    profilePhoto: {
      path: user.profilePhotoPath,
      updatedAt: user.profilePhotoUpdatedAt,
    },
  }
}
