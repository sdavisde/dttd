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

/** Stable identity for an item, independent of where its link points today. */
export type MemberNavKey =
  | 'home'
  | 'sponsor'
  | 'my-forms'
  | 'pay-fee'
  | 'roster'
  | 'weekends'
  | 'documents'
  | 'account'
  | 'admin'

export type MemberNavItem = {
  key: MemberNavKey
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
  /** Shorter label for the tab bar, when the sidebar title is too long. */
  tabLabel?: string
  /** Position in the tab bar (Main board order); lower comes first. */
  tabOrder?: number
}

/**
 * The single source of truth for member navigation: order, routes, icons,
 * sections, and who sees what. The sidebar, the phone tab bar and the search
 * palette all render from this list.
 */
export const memberNavItems: MemberNavItem[] = [
  {
    key: 'home',
    title: 'Home',
    href: '/home',
    icon: Home,
    section: null,
    permissionsNeeded: [],
    tab: true,
    tabOrder: 0,
  },
  {
    key: 'sponsor',
    title: 'Sponsor someone',
    href: '/sponsor',
    icon: HeartHandshake,
    section: 'Do something',
    permissionsNeeded: [],
  },
  {
    key: 'my-forms',
    title: 'My forms',
    href: '/team-forms',
    icon: FileText,
    section: 'Do something',
    permissionsNeeded: [],
    requiresTeamMembership: true,
  },
  {
    key: 'pay-fee',
    title: 'Pay a fee',
    href: '/payment/team-fee',
    icon: CreditCard,
    section: 'Do something',
    permissionsNeeded: [],
    requiresTeamMembership: true,
  },
  {
    key: 'roster',
    title: 'Roster',
    // Rosters are per-weekend: the shell points this at the active group's
    // Team tab (see `resolveMemberNavHrefs`).
    href: '/weekends',
    icon: Users,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
    tabOrder: 2,
  },
  {
    key: 'weekends',
    title: 'The weekends',
    href: '/weekends',
    icon: Calendar,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
    tabLabel: 'Weekends',
    tabOrder: 1,
  },
  {
    key: 'documents',
    title: 'Documents',
    href: '/files',
    icon: FolderOpen,
    section: 'Find',
    permissionsNeeded: [],
    tab: true,
    tabOrder: 3,
  },
]

/** Footer items: account first, then the admin link for those who have it. */
export const memberFooterNavItems: MemberNavItem[] = [
  {
    key: 'account',
    title: 'My account',
    href: '/profile',
    icon: CircleUser,
    section: null,
    permissionsNeeded: [],
    tab: true,
    tabOrder: 4,
  },
  {
    key: 'admin',
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
  key: MemberNavKey
  title: string
  href: string
  section: MemberNavSection
  tab?: boolean
  tabLabel?: string
  tabOrder?: number
}

export type MemberNavContext = {
  /** The ACTIVE weekend group, when there is one. */
  activeGroupId: string | null
}

/**
 * Where an item points for this visit. Rosters live on each weekend's hub, so
 * "Roster" opens the active group's Team tab and falls back to the weekends
 * index when nothing is active.
 */
export function resolveMemberNavHref(
  item: Pick<MemberNavItem, 'key' | 'href'>,
  context: MemberNavContext
): string {
  if (item.key === 'roster' && !isNil(context.activeGroupId)) {
    return `/weekends/${context.activeGroupId}/team`
  }
  return item.href
}

function serialize(
  items: MemberNavItem[],
  context: MemberNavContext
): SerializableMemberNavItem[] {
  return items.map(
    ({ key, title, href, section, tab, tabLabel, tabOrder }) => ({
      key,
      title,
      href: resolveMemberNavHref({ key, href }, context),
      section,
      tab,
      tabLabel,
      tabOrder,
    })
  )
}

export type MemberNav = {
  main: SerializableMemberNavItem[]
  footer: SerializableMemberNavItem[]
}

export function getMemberNav(
  user: User,
  context: MemberNavContext = { activeGroupId: null }
): MemberNav {
  return {
    main: serialize(filterMemberNav(memberNavItems, user), context),
    footer: serialize(filterMemberNav(memberFooterNavItems, user), context),
  }
}

/**
 * The phone tab bar: every visible item flagged `tab`, in the Main board's
 * order (Home · Weekends · Roster · Documents · My account), with the short
 * tab label standing in for the sidebar title.
 */
export function getTabBarItems(nav: MemberNav): SerializableMemberNavItem[] {
  return [...nav.main, ...nav.footer]
    .filter((item) => item.tab === true)
    .sort((a, b) => (a.tabOrder ?? 99) - (b.tabOrder ?? 99))
    .map((item) => ({ ...item, title: item.tabLabel ?? item.title }))
}

export function getMemberNavIcon(key: MemberNavKey): LucideIcon | undefined {
  return allItems.find((item) => item.key === key)?.icon
}

function matchesPath(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * The one item to highlight for a path: the longest matching href wins, so
 * `/weekends/<id>/team` lights up Roster rather than The weekends, while
 * every other hub page (and `/files/handbook`, `/team-forms/camp-waiver`)
 * still highlights its section. On an exact tie (Roster falling back to
 * `/weekends` when nothing is active) the later item wins, so the index
 * page highlights The weekends.
 */
export function activeMemberNavKey(
  items: Pick<SerializableMemberNavItem, 'key' | 'href'>[],
  pathname: string
): MemberNavKey | null {
  let best: Pick<SerializableMemberNavItem, 'key' | 'href'> | null = null
  for (const item of items) {
    if (!matchesPath(item.href, pathname)) continue
    if (isNil(best) || item.href.length >= best.href.length) best = item
  }
  return best?.key ?? null
}
