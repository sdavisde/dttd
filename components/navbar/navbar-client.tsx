'use client'

import { ChevronDown, Menu, MonitorCog, LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
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
import { NavElement, NavIconName } from './navbar-server'
import { isEmpty, isNil } from 'lodash'

// Map icon names to actual Lucide icon components
const iconMap: Record<NavIconName, LucideIcon> = {
  home: LucideIcons.Home,
  calendar: LucideIcons.Calendar,
  users: LucideIcons.Users,
  'file-text': LucideIcons.FileText,
  clock: LucideIcons.Clock,
  'clipboard-list': LucideIcons.ClipboardList,
  'user-check': LucideIcons.UserCheck,
  'folder-open': LucideIcons.FolderOpen,
  heart: LucideIcons.Heart,
  star: LucideIcons.Star,
}

function getIcon(iconName?: NavIconName): LucideIcon | null {
  if (!iconName) return null
  return iconMap[iconName] || null
}

type NavbarClientProps = {
  navElements: NavElement[]
}

export function Navbar({ navElements }: NavbarClientProps) {
  useToastListener()
  const [isOpen, setIsOpen] = useState(false)
  const [impersonationOpen, setImpersonationOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
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
        .filter((child) => !isNil(child))

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

  // Split nav elements for centered logo layout
  const midpoint = Math.ceil(filteredNavElements.length / 2)
  const leftNavElements = filteredNavElements.slice(0, midpoint)
  const rightNavElements = filteredNavElements.slice(midpoint)

  const renderNavItem = (item: NavElement) => {
    const hasChildren = !isNil(item.children) && !isEmpty(item.children)

    return (
      <div
        key={item.name}
        className="relative"
        onMouseEnter={() => hasChildren && setActiveMenu(item.name)}
        onMouseLeave={() => setActiveMenu(null)}
      >
        {hasChildren ? (
          <button
            className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeMenu === item.name
                ? 'text-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            {item.name}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${activeMenu === item.name ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <Link
            href={`/${item.slug}`}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        )}

        {/* Mega Menu Dropdown */}
        {hasChildren && activeMenu === item.name && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
            {/* Invisible bridge to prevent menu from closing when moving to it */}
            <div className="absolute -top-2 left-0 right-0 h-2" />
            <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
              <div className="space-y-1">
                {item.children!.map((child) => {
                  const Icon = getIcon(child.icon)
                  return (
                    <Link
                      key={child.name}
                      href={`/${child.slug}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {Icon && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {child.name}
                        </div>
                        {child.description && (
                          <div className="text-sm text-gray-500 mt-0.5">
                            {child.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary" />

      <nav className="bg-white shadow-sm px-4 py-4 relative">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
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
                        className="text-lg font-medium py-2 hover:text-primary transition-colors"
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

          {/* Left section - nav items (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {isAuthenticated && leftNavElements.map(renderNavItem)}
          </div>

          {/* Centered Logo - absolutely positioned for true center */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex flex-col items-center">
              <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                DTTD
              </span>
              <span className="hidden md:block text-[10px] text-primary uppercase tracking-widest font-medium">
                Dusty Trails Tres Dias
              </span>
            </Link>
          </div>

          {/* Right section - nav items + user controls (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
            {isAuthenticated && rightNavElements.map(renderNavItem)}
          </div>

          {/* Spacer for mobile to push avatar right */}
          <div className="flex-1 md:hidden" />

          {/* Admin Icon & Avatar */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {!isNil(user) &&
                userHasPermission(user, [Permission.READ_ADMIN_PORTAL]) && (
                  <Link
                    href="/admin"
                    className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
                    title="Admin"
                  >
                    <MonitorCog className="h-5 w-5" />
                    <span className="sr-only">Admin</span>
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
                    <DropdownMenuItem
                      onClick={() => setImpersonationOpen(true)}
                    >
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
    </>
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
      <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-medium py-2 hover:text-primary transition-colors">
        {item.name}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-2">
        {item.children?.map((child) => {
          const Icon = getIcon(child.icon)
          return (
            <Link
              key={child.name}
              href={`/${child.slug}`}
              className="flex items-center gap-3 py-2 hover:text-primary transition-colors"
              onClick={onNavigate}
            >
              {Icon && <Icon className="h-4 w-4 text-primary" />}
              <div>
                <div className="text-base">{child.name}</div>
                {child.description && (
                  <div className="text-xs text-gray-500">
                    {child.description}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}
