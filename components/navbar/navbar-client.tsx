'use client'

import { useState } from 'react'
import { useSession } from '@/components/auth/session-provider'
import { useToastListener } from '@/components/toastbox'
import { permissionLock } from '@/lib/security'
import { NavElement } from './navbar-server'
import { NavLogo } from './nav-logo'
import { DesktopNavItem } from './desktop-nav-item'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { isNil } from 'lodash'

type NavbarClientProps = {
  navElements: NavElement[]
}

export function Navbar({ navElements }: NavbarClientProps) {
  useToastListener()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { isAuthenticated, user } = useSession()

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

  return (
    <>
      {/* Accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary" />

      <nav className="bg-white shadow-sm px-4 py-4 relative">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <MobileNav navElements={filteredNavElements} />

          {/* Left section - nav items (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {isAuthenticated &&
              leftNavElements.map((item) => (
                <DesktopNavItem
                  key={item.name}
                  item={item}
                  align="left"
                  isActive={activeMenu === item.name}
                  onMouseEnter={() => item.children && setActiveMenu(item.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                />
              ))}
          </div>

          {/* Centered Logo */}
          <NavLogo />

          {/* Right section - nav items + user controls (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
            {isAuthenticated &&
              rightNavElements.map((item) => (
                <DesktopNavItem
                  key={item.name}
                  item={item}
                  align="right"
                  isActive={activeMenu === item.name}
                  onMouseEnter={() => item.children && setActiveMenu(item.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                />
              ))}
          </div>

          {/* Spacer for mobile to push avatar right */}
          <div className="flex-1 md:hidden" />

          {/* User Menu */}
          <UserMenu isAuthenticated={isAuthenticated} user={user} />
        </div>
      </nav>
    </>
  )
}
