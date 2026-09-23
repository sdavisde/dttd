'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNil } from 'lodash'
import {
  getMemberNavIcon,
  isMemberNavItemActive,
  type MemberNav,
  type MemberNavSection,
  type SerializableMemberNavItem,
} from '@/lib/member/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

type MemberSidebarProps = React.ComponentProps<typeof Sidebar> & {
  nav: MemberNav
}

const SECTION_ORDER: MemberNavSection[] = [null, 'Do something', 'Find']

function NavItems({ items }: { items: SerializableMemberNavItem[] }) {
  const pathname = usePathname()
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = getMemberNavIcon(item.href)
        const isActive = isMemberNavItemActive(item.href, pathname)
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              // Resting nav text is quieter than the sidebar's own
              // foreground; the active item carries the weight instead.
              className={isActive ? 'font-semibold' : 'text-nav-foreground'}
            >
              <Link href={item.href}>
                {!isNil(Icon) && <Icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/**
 * The member site's sidebar (VerbNav board): task-named groups on desktop,
 * collapsing to an icon rail; a sheet on phones (opened from the top bar,
 * though the tab bar covers the primary destinations there).
 */
export function MemberSidebar({ nav, ...props }: MemberSidebarProps) {
  const sections = SECTION_ORDER.map((section) => ({
    section,
    items: nav.main.filter((item) => item.section === section),
  })).filter(({ items }) => items.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/home">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-sm font-semibold text-primary-foreground">
                  DT
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-serif text-[15px] font-semibold">
                    Dusty Trails
                  </span>
                  <span className="truncate text-[11.5px] text-muted-foreground">
                    Tres Dias
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sections.map(({ section, items }) => (
          <SidebarGroup key={section ?? 'top'}>
            {!isNil(section) && (
              <SidebarGroupLabel className="text-[11.5px] font-semibold tracking-[0.1em] text-muted-foreground/80 uppercase">
                {section}
              </SidebarGroupLabel>
            )}
            <NavItems items={items} />
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <NavItems items={nav.footer} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
