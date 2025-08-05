'use client'

import * as React from 'react'
import { SquareTerminal, BookOpen, type LucideIcon, Users } from 'lucide-react'
import { NavMain } from '@/components/admin/sidebar/nav-main'
import { SystemLinks } from '@/components/admin/sidebar/system-links'
import { NavUser } from '@/components/admin/sidebar/nav-user'
import { TeamSwitcher } from '@/components/admin/sidebar/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// Icon mapping for serializable data
const iconMap: Record<string, LucideIcon> = {
  SquareTerminal,
  Users,
  BookOpen,
}

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: {
    navMain: Array<{
      title: string
      url: string
      icon?: string
      isActive?: boolean
      items?: Array<{
        title: string
        url: string
      }>
    }>
  }
}

export function AdminSidebar({ data, ...props }: AdminSidebarProps) {
  // Transform the data to include actual icon components
  const transformedData = {
    navMain: data.navMain.map((item) => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedData.navMain} />
        <SystemLinks />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
