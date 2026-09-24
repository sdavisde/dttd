'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNil } from 'lodash'
import {
  activeMemberNavKey,
  getMemberNavIcon,
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
import { RoleAccessMark } from '@/components/member/role-access-mark'

type MemberSidebarProps = React.ComponentProps<typeof Sidebar> & {
  nav: MemberNav
}

const SECTION_ORDER: MemberNavSection[] = [
  null,
  'Do something',
  'Find',
  'Role tools',
]

/** Sections that render as a plain group, without a heading. */
const UNLABELED: MemberNavSection[] = [null, 'Role tools']

function NavItems({
  items,
  activeKey,
}: {
  items: SerializableMemberNavItem[]
  activeKey: string | null
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = getMemberNavIcon(item.key)
        const isActive = item.key === activeKey
        return (
          <SidebarMenuItem key={item.key}>
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
                {item.section === 'Role tools' && (
                  <RoleAccessMark className="ml-auto group-data-[collapsible=icon]:hidden" />
                )}
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
  const pathname = usePathname()
  // One winner across every group, so the review queue lights up Review
  // candidates alone rather than The weekend too.
  const activeKey = activeMemberNavKey([...nav.main, ...nav.footer], pathname)
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
            {section === 'Role tools' && (
              <SidebarSeparator className="mx-0 mb-2" />
            )}
            {!UNLABELED.includes(section) && (
              <SidebarGroupLabel className="text-[11.5px] font-semibold tracking-[0.1em] text-muted-foreground/80 uppercase">
                {section}
              </SidebarGroupLabel>
            )}
            <NavItems items={items} activeKey={activeKey} />
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <NavItems items={nav.footer} activeKey={activeKey} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
