'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { NavElement } from './navbar-server'
import { NavbarIcon } from './navbar-icon'

type MegaMenuLinkProps = {
  item: NavElement
}

export function MegaMenuLink({ item }: MegaMenuLinkProps) {
  return (
    <Link
      href={`/${item.slug}`}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      {item.icon && (
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            item.badge === 'restricted'
              ? 'bg-amber-100 group-hover:bg-amber-200'
              : 'bg-primary/10 group-hover:bg-primary/20'
          }`}
        >
          <NavbarIcon
            iconName={item.icon}
            className={`h-5 w-5 ${
              item.badge === 'restricted' ? 'text-amber-700' : 'text-primary'
            }`}
          />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
            {item.name}
          </span>
          {item.badge === 'restricted' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
              <Lock className="h-2.5 w-2.5" />
              Restricted
            </span>
          )}
        </div>
        {item.description && (
          <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>
        )}
      </div>
    </Link>
  )
}
