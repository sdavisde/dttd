'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { isNil } from 'lodash'
import { NavUser } from '@/components/admin/sidebar/nav-user'
import {
  getNavIcon,
  isNavItemActive,
  type SerializableNavItem,
} from '@/lib/admin/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  items: SerializableNavItem[]
}

export function AdminSidebar({ items, ...props }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-sm font-semibold text-primary-foreground">
                  DT
                </div>
                <div className="flex flex-1 items-center gap-2 text-left leading-tight">
                  <span className="truncate font-medium">Dusty Trails</span>
                  <span className="rounded-full border border-secondary-border bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
                    Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = getNavIcon(item.href)
              if (item.soon === true) {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      aria-disabled
                      className="text-muted-foreground/70 hover:bg-transparent hover:text-muted-foreground/70 active:bg-transparent"
                      tooltip={`${item.title} — coming soon`}
                    >
                      {!isNil(Icon) && <Icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-[10px] font-bold tracking-wider text-muted-foreground/70">
                      SOON
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                )
              }
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(item.href, pathname)}
                    tooltip={item.title}
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to member site">
              <Link href="/home">
                <ArrowLeft />
                <span>Back to member site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
