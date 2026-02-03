'use client'

import { NavElement } from './navbar-server'
import { MegaMenuLink } from './mega-menu-link'
import { FeaturedContentPanel } from './featured-content-panel'

type MegaMenuDropdownProps = {
  item: NavElement
  align: 'left' | 'right'
}

export function MegaMenuDropdown({ item, align }: MegaMenuDropdownProps) {
  // Determine dropdown alignment based on position and whether it has featured content
  const dropdownAlign =
    item.featured && align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'

  return (
    <div className={`absolute top-full ${dropdownAlign} pt-2 z-50`}>
      {/* Invisible bridge to prevent menu from closing when moving to it */}
      <div className="absolute -top-2 left-0 right-0 h-2" />
      <div
        className={`bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden ${
          item.featured ? 'w-[480px]' : 'w-80'
        }`}
      >
        <div className={item.featured ? 'flex' : ''}>
          {/* Nav links */}
          <div
            className={`p-4 ${item.featured ? 'flex-1 border-r border-gray-100' : ''}`}
          >
            <div className="space-y-1">
              {item.children!.map((child) => (
                <MegaMenuLink key={child.name} item={child} />
              ))}
            </div>
          </div>

          {/* Featured content panel */}
          {item.featured && <FeaturedContentPanel featured={item.featured} />}
        </div>
      </div>
    </div>
  )
}
