'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react'

import { NavMain } from '@/components/admin/sidebar/nav-main'
import { SystemLinks } from '@/components/admin/sidebar/system-links'
import { NavUser } from '@/components/admin/sidebar/nav-user'
import { TeamSwitcher } from '@/components/admin/sidebar/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Weekends',
      url: '/admin/weekends',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Upcoming Weekend',
          url: '/admin/weekends/upcoming',
        },
        {
          title: 'Meetings',
          url: '/admin/weekends/meetings',
        },
        {
          title: 'Create Weekend',
          url: '/admin/weekends/create',
        },
      ],
    },
    {
      title: 'Community',
      url: '/admin/community',
      icon: Bot,
    },
    {
      title: 'Files',
      url: '/admin/files',
      icon: BookOpen,
      items: [
        {
          title: 'Job Descriptions',
          url: '/admin/files/job-descriptions',
        },
        {
          title: 'Timelines',
          url: '/admin/files/timelines',
        },
      ],
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible='icon'
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={[]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SystemLinks />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
