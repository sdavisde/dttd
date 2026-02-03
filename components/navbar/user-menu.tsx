'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MonitorCog } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { Permission, canImpersonate, userHasPermission } from '@/lib/security'
import { ImpersonationDialog } from '@/components/admin/sidebar/impersonation-dialog'
import { User } from '@/lib/users/types'
import { isNil } from 'lodash'

type UserMenuProps = {
  isAuthenticated: boolean
  user: User | null
}

export function UserMenu({ isAuthenticated, user }: UserMenuProps) {
  const [impersonationOpen, setImpersonationOpen] = useState(false)
  const router = useRouter()
  const showImpersonation = canImpersonate(user)

  if (!isAuthenticated) {
    return (
      <Button variant="outline" href="/login">
        Login
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {!isNil(user) &&
        userHasPermission(user, [Permission.READ_ADMIN_PORTAL]) && (
          <Link
            href="/admin"
            className="flex gap-2 p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
            title="Admin"
          >
            <MonitorCog className="h-5 w-5" />
            <span>Admin</span>
          </Link>
        )}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex-shrink-0">
            <Avatar className="h-9 w-9 bg-primary">
              <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          {showImpersonation && (
            <DropdownMenuItem onClick={() => setImpersonationOpen(true)}>
              Impersonate User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.refresh()
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showImpersonation && (
        <ImpersonationDialog
          open={impersonationOpen}
          onOpenChange={setImpersonationOpen}
        />
      )}
    </div>
  )
}
