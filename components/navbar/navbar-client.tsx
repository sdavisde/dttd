'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/components/auth/session-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { permissionLock } from '@/lib/security'
import { useToastListener } from '../toastbox'

type NavElement = {
  name: string
  slug: string
  /**
   * Slightly overloaded - will try to match any of these permissions against user permissions or CHARole
   */
  permissions_needed: string[]
  children?: NavElement[]
}

type NavbarClientProps = {
  navElements: NavElement[]
}

export function Navbar({ navElements }: NavbarClientProps) {
  useToastListener()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user } = useSession()
  const router = useRouter()
  const filteredNavElements = navElements.filter((item) => {
    try {
      if (item.permissions_needed.length === 0) {
        return true
      }

      permissionLock(item.permissions_needed)(user)
      return true
    } catch (e) {
      return false
    }
  })

  return (
    <nav className="bg-primary text-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>DTTD</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 px-4">
                {filteredNavElements.map((item) => (
                  <Link
                    key={item.name}
                    href={`/${item.slug}`}
                    className="text-lg font-medium hover:underline transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo/Title */}
        <div className="flex-1 md:flex-none flex items-center justify-start ms-2">
          <Link href="/" className="font-bold text-xl md:text-2xl">
            <span className="hidden md:inline">Dusty Trails Tres Dias</span>
            <span className="md:hidden">DTTD</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-end me-8">
            {filteredNavElements.map((item) => (
              <Link
                key={item.name}
                href={`/${item.slug}`}
                className="text-white hover:text-amber-200 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        {/* Avatar */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 bg-white">
                  <AvatarFallback className="bg-white text-amber-900 font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
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
        ) : (
          <Button variant="outline" href="/login">
            Login
          </Button>
        )}
      </div>
    </nav>
  )
}
