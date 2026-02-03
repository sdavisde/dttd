'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Lock, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NavElement } from './navbar-server'
import { NavbarIcon } from './navbar-icon'

type MobileNavProps = {
  navElements: NavElement[]
}

export function MobileNav({ navElements }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
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
            {navElements.map((item) =>
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
  )
}

type MobileNavItemProps = {
  item: NavElement
  onNavigate: () => void
}

function MobileNavItem({ item, onNavigate }: MobileNavItemProps) {
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
          return (
            <Link
              key={child.name}
              href={`/${child.slug}`}
              className="flex items-center gap-3 py-2 hover:text-primary transition-colors"
              onClick={onNavigate}
            >
              {child.icon && (
                <NavbarIcon
                  iconName={child.icon}
                  className={`h-4 w-4 ${
                    child.badge === 'restricted'
                      ? 'text-amber-600'
                      : 'text-primary'
                  }`}
                />
              )}
              <div>
                <div className="flex items-center gap-2 text-base">
                  {child.name}
                  {child.badge === 'restricted' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
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
