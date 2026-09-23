import { isNil } from 'lodash'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Mail, Phone } from 'lucide-react'
import { getAvatarUrl } from '@/lib/avatar/avatar-url'
import { getAvatarColor, getInitials } from '@/lib/avatar/initials'
import { cn, formatPhoneNumber } from '@/lib/utils'
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
  /** Shown in the hover card when defined; the avatar itself never uses it. */
  phone_number?: string | null
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
 * Wraps `UserAvatar` in a hover card showing a larger photo with the user's
 * name, email (their username) and phone number when they have one. Use this
 * on surfaces without an existing hover interaction.
 */
export function UserAvatarWithPreview({
  user,
  size = 36,
  className,
}: UserAvatarProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const hasEmail = !isNil(user.email) && user.email !== ''
  const hasPhone = !isNil(user.phone_number) && user.phone_number !== ''

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-default shrink-0">
          <UserAvatar user={user} size={size} className={className} />
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start">
        <div className="flex items-start gap-3.5">
          <UserAvatar
            user={user}
            size={64}
            className="ring-border ring-2 ring-offset-2 ring-offset-popover"
          />
          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
            <p className="font-serif text-base leading-tight font-semibold tracking-tight">
              {fullName !== '' ? fullName : 'Unknown user'}
            </p>
            {hasEmail && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{user.email}</span>
              </p>
            )}
            {hasPhone && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {formatPhoneNumber(user.phone_number)}
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
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
    | 'phoneNumber'
    | 'profilePhotoPath'
    | 'profilePhotoUpdatedAt'
  >
): UserAvatarUser {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone_number: user.phoneNumber,
    profilePhoto: {
      path: user.profilePhotoPath,
      updatedAt: user.profilePhotoUpdatedAt,
    },
  }
}
