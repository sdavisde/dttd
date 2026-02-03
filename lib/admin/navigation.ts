import { Permission, userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'

export type AdminNavElement = {
  title: string
  url: string
  icon: string
  description: string
  isActive?: boolean
  permissions_needed: Permission[]
  items?: Array<{ title: string; url: string }>
}

export type SystemLinkElement = {
  title: string
  url: string
  icon: string
  description: string
  permissions_needed: Permission[]
}

/**
 * Main navigation items for the admin sidebar and dashboard
 */
export const adminNavItems: AdminNavElement[] = [
  {
    title: 'Weekends',
    url: '/admin/weekends',
    icon: 'TentTree',
    description:
      'Create and manage weekends - view related events, and historical weekend information.',
    isActive: true,
    permissions_needed: [Permission.READ_WEEKENDS],
  },
  {
    title: 'Events',
    url: '/admin/meetings',
    icon: 'Calendar',
    description: 'Schedule and manage community meetings and gatherings.',
    permissions_needed: [Permission.READ_EVENTS],
  },
  {
    title: 'Payments',
    url: '/admin/payments',
    icon: 'DollarSign',
    description:
      'View payments reported to the site. Includes all online payments, and any manually added team fees or candidate fees.',
    permissions_needed: [Permission.READ_PAYMENTS],
  },
  {
    title: 'Community Board',
    url: '/admin/community-board',
    icon: 'ClipboardList',
    description:
      'Track board positions, leaders committee assignments, and meeting minutes.',
    permissions_needed: [],
  },
  {
    title: 'Master Roster',
    url: '/admin/users',
    icon: 'Users',
    description: 'View the Dusty Trails community master roster',
    permissions_needed: [],
  },
  {
    title: 'Files',
    url: '/admin/files',
    icon: 'Folder',
    description:
      'Upload, organize, and manage files for weekends and documentation.',
    permissions_needed: [],
  },
]

/**
 * System links for the admin sidebar and dashboard
 */
export const systemLinkItems: SystemLinkElement[] = [
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: 'Settings2',
    description: 'Configure system preferences and application settings.',
    permissions_needed: [],
  },
  {
    title: 'Security',
    url: '/admin/roles',
    icon: 'ShieldCheck',
    description: 'Manage user roles and security permissions.',
    permissions_needed: [Permission.READ_USER_ROLES],
  },
]

/**
 * Filter navigation items based on user permissions
 */
export function filterNavByPermission<
  T extends { permissions_needed: Permission[] },
>(items: T[], user: User): T[] {
  return items.filter((item) => {
    if (item.permissions_needed.length === 0) return true
    return userHasPermission(user, item.permissions_needed)
  })
}

/**
 * Get filtered navigation data for a user
 * Used by both the sidebar and the dashboard page
 */
export function getFilteredNavData(
  user: User,
  fileFolders?: Array<{ title: string; url: string }>
) {
  const navMain = adminNavItems.map((item) => ({
    ...item,
    items: item.url === '/admin/files' && fileFolders ? fileFolders : undefined,
  }))

  return {
    navMain: filterNavByPermission(navMain, user),
    systemLinks: filterNavByPermission(systemLinkItems, user),
  }
}
