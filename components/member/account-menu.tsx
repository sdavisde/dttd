'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleUser, LogOut, ShieldCheck, UserRoundSearch } from 'lucide-react'
import { UserAvatar, avatarUserFromDto } from '@/components/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { canImpersonate } from '@/lib/security'
import { ImpersonationDialog } from '@/components/impersonation/impersonation-dialog'
import { useSession } from '@/components/auth/session-provider'
import { isNil } from 'lodash'

type AccountMenuProps = {
  /** Resolved on the server so the link never flickers in. */
  showAdmin: boolean
}

/**
 * Avatar menu in the member top bar: profile, impersonation for those who
 * may, the admin portal for those who have it, and the site's only sign-out.
 */
export function AccountMenu({ showAdmin }: AccountMenuProps) {
  const { user } = useSession()
  const router = useRouter()
  const [impersonationOpen, setImpersonationOpen] = useState(false)

  if (isNil(user)) {
    return <div className="size-[34px] rounded-full bg-muted" aria-hidden />
  }

  const showImpersonation = canImpersonate(user)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <UserAvatar user={avatarUserFromDto(user)} size={34} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <div className="grid leading-tight">
              <span className="truncate text-sm font-semibold">
                {user.firstName} {user.lastName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <CircleUser />
              My account
            </Link>
          </DropdownMenuItem>
          {showImpersonation && (
            <DropdownMenuItem onClick={() => setImpersonationOpen(true)}>
              <UserRoundSearch />
              Impersonate user
            </DropdownMenuItem>
          )}
          {showAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck />
                Admin
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/login')
              router.refresh()
            }}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showImpersonation && (
        <ImpersonationDialog
          open={impersonationOpen}
          onOpenChange={setImpersonationOpen}
        />
      )}
    </>
  )
}
