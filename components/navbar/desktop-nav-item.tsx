'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { NavElement } from './navbar-server'
import { MegaMenuDropdown } from './mega-menu-dropdown'
import { isEmpty, isNil } from 'lodash'

type DesktopNavItemProps = {
  item: NavElement
  align: 'left' | 'right'
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function DesktopNavItem({
  item,
  align,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: DesktopNavItemProps) {
  const hasChildren = !isNil(item.children) && !isEmpty(item.children)

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {hasChildren ? (
        <button
          className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
            isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
          }`}
        >
          {item.name}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`}
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
      {hasChildren && isActive && (
        <MegaMenuDropdown item={item} align={align} />
      )}
    </div>
  )
}
