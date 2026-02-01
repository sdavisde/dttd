'use client'

import { ChevronDown, Menu, MonitorCog } from 'lucide-react'
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSession } from '@/components/auth/session-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Permission,
  permissionLock,
  canImpersonate,
  userHasPermission,
} from '@/lib/security'
import { useToastListener } from '@/components/toastbox'
import { ImpersonationDialog } from '@/components/admin/sidebar/impersonation-dialog'
import { NavElement } from './navbar-server'
import { isNil } from 'lodash'

type NavbarClientProps = {
  navElements: NavElement[]
}

export function Navbar({ navElements }: NavbarClientProps) {
  useToastListener()
  const [isOpen, setIsOpen] = useState(false)
  const [impersonationOpen, setImpersonationOpen] = useState(false)
  const { isAuthenticated, user } = useSession()
  const router = useRouter()
  const showImpersonation = canImpersonate(user)

  // Filter nav elements based on user permissions
  const filterNavElement = (item: NavElement): NavElement | null => {
    // Check if user has permission for this item
    if (item.permissions_needed.length > 0) {
      try {
        permissionLock(item.permissions_needed)(user)
      } catch {
        return null
      }
    }

    // Filter children if they exist
    if (item.children) {
      const filteredChildren = item.children
        .map(filterNavElement)
        .filter((child): child is NavElement => child !== null)

      // If all children are filtered out, don't show the parent
      if (filteredChildren.length === 0) {
        return null
      }

      return { ...item, children: filteredChildren }
    }

    return item
  }

  const filteredNavElements = navElements
    .map(filterNavElement)
    .filter((item) => !isNil(item))

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
              <div className="flex flex-col space-y-2 px-4">
                {filteredNavElements.map((item) =>
                  item.children ? (
                    <MobileNavItem
                      key={item.name}
                      item={item}
                      onNavigate={() => setIsOpen(false)}
                    />
                  ) : (
                    <Link
                      key={item.name}
                      href={`/${item.slug}`}
                      className="text-lg font-medium py-2 hover:underline transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                )}
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
          <div className="hidden md:flex items-center flex-1 justify-end me-8">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="gap-2">
                {filteredNavElements.map((item) =>
                  item.children ? (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 focus:bg-white/10 focus:text-white">
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-48 gap-1 p-2">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/${child.slug}`}
                                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.name}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/${item.slug}`}
                          className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none"
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        {/* Admin Icon & Avatar */}
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            {!isNil(user) &&
              userHasPermission(user, [Permission.READ_ADMIN_PORTAL]) && (
                <Link
                  href="/admin"
                  className="text-white hover:text-amber-200 transition-colors"
                  title="Admin"
                >
                  <MonitorCog className="h-6 w-6" />
                  <span className="sr-only">Admin</span>
                </Link>
              )}
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
        ) : (
          <Button variant="outline" href="/login">
            Login
          </Button>
        )}
      </div>
    </nav>
  )
}

// Mobile collapsible nav item component
function MobileNavItem({
  item,
  onNavigate,
}: {
  item: NavElement
  onNavigate: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-medium py-2 hover:underline transition-colors">
        {item.name}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-2">
        {item.children?.map((child) => (
          <Link
            key={child.name}
            href={`/${child.slug}`}
            className="block text-base py-1 hover:underline transition-colors"
            onClick={onNavigate}
          >
            {child.name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
