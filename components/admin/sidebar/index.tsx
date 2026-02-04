'use client'

import * as React from 'react'
import {
  SquareTerminal,
  type LucideIcon,
  Users,
  Calendar,
  DollarSign,
  TentTree,
  Folder,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
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
  Folder,
  Calendar,
  DollarSign,
  TentTree,
  Settings2,
  ShieldCheck,
}

type SystemLinkItem = {
  title: string
  url: string
  icon: string
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
  systemLinks: SystemLinkItem[]
}

export function AdminSidebar({
  data,
  systemLinks,
  ...props
}: AdminSidebarProps) {
  // Transform the data to include actual icon components
  const transformedData = {
    navMain: data.navMain.map((item) => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
  }

  // Transform system links to include actual icon components
  const transformedSystemLinks = systemLinks.map((item) => ({
    ...item,
    icon: iconMap[item.icon],
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedData.navMain} />
        <SystemLinks items={transformedSystemLinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
