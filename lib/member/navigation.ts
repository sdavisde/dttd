import { Permission, userHasPermission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import { isNil } from 'lodash'
import {
  Calendar,
  CircleUser,
  CreditCard,
  FileText,
  FolderOpen,
  HeartHandshake,
  Home,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * Sidebar sections, in order. `null` renders as the top-level (unlabeled)
 * group; the rest are the task-named groups from the design board.
 */
export type MemberNavSection = null | 'Do something' | 'Find'

export type MemberNavItem = {
  title: string
  href: string
  icon: LucideIcon
  section: MemberNavSection
  /** Empty means visible to every signed-in member. */
  permissionsNeeded: Permission[]
  /** Only shown to people on the active weekend team. */
  requiresTeamMembership?: boolean
  /** Appears in the phone tab bar (at most five). */
  tab?: boolean
}

/**
 * The single source of truth for member navigation: order, routes, icons,
 * sections, and who sees what. The sidebar, the phone tab bar and the search
 * palette all render from this list.
 */
export const memberNavItems: MemberNavItem[] = [
  {
    title: 'Home',
    href: '/home',
    icon: Home,
    section: null,
    permissionsNeeded: [],
    tab: true,
  },
  {
    title: 'Sponsor someone',
    href: '/sponsor',
    icon: HeartHandshake,
    section: 'Do something',
    permissionsNeeded: [],
  },
  {
    title: 'My forms',
    href: '/team-forms',
    icon: FileText,
    section: 'Do something',
    permissionsNeeded: [],
    requiresTeamMembership: true,
  },
  {
    title: 'Pay a fee',
    href: '/payment/team-fee',
    icon: CreditCard,
    section: 'Do something',
    permissionsNeeded: [],
    requiresTeamMembership: true,
  },
  {
    title: 'Roster',
    href: '/roster',
    icon: Users,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
  },
  {
    title: 'The weekends',
    href: '/current-weekend',
    icon: Calendar,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
  },
  {
    title: 'Documents',
    href: '/files',
    icon: FolderOpen,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
  },
]

/** Footer items: account first, then the admin link for those who have it. */
export const memberFooterNavItems: MemberNavItem[] = [
  {
    title: 'My account',
    href: '/profile',
    icon: CircleUser,
    section: null,
    permissionsNeeded: [],
    tab: true,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: ShieldCheck,
    section: null,
    permissionsNeeded: [Permission.READ_ADMIN_PORTAL],
  },
]

const allItems = [...memberNavItems, ...memberFooterNavItems]

export function filterMemberNav(items: MemberNavItem[], user: User) {
  return items.filter((item) => {
    if (item.requiresTeamMembership === true && isNil(user.teamMemberInfo)) {
      return false
    }
    if (item.permissionsNeeded.length === 0) return true
    return userHasPermission(user, item.permissionsNeeded)
  })
}

/**
 * Serializable shape safe to pass from the server layout to client chrome
 * (icon components stay on this module; the client looks them up by href).
 */
export type SerializableMemberNavItem = {
  title: string
  href: string
  section: MemberNavSection
  tab?: boolean
}

function serialize(items: MemberNavItem[]): SerializableMemberNavItem[] {
  return items.map(({ title, href, section, tab }) => ({
    title,
    href,
    section,
    tab,
  }))
}

export type MemberNav = {
  main: SerializableMemberNavItem[]
  footer: SerializableMemberNavItem[]
}

export function getMemberNav(user: User): MemberNav {
  return {
    main: serialize(filterMemberNav(memberNavItems, user)),
    footer: serialize(filterMemberNav(memberFooterNavItems, user)),
  }
}

/** The phone tab bar: every visible item flagged `tab`, in nav order. */
export function getTabBarItems(nav: MemberNav): SerializableMemberNavItem[] {
  return [...nav.main, ...nav.footer].filter((item) => item.tab === true)
}

export function getMemberNavIcon(href: string): LucideIcon | undefined {
  return allItems.find((item) => item.href === href)?.icon
}

/**
 * Longest-prefix active matching so nested routes highlight their section
 * (e.g. `/files/handbook` → Documents, `/team-forms/camp-waiver` → My forms).
 */
export function isMemberNavItemActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
