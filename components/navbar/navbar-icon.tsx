'use client'

import { LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { NavIconName } from './navbar-server'
import { isNil } from 'lodash'

// Map icon names to actual Lucide icon components
export const iconMap: Record<NavIconName, LucideIcon> = {
  home: LucideIcons.Home,
  calendar: LucideIcons.Calendar,
  users: LucideIcons.Users,
  'file-text': LucideIcons.FileText,
  clock: LucideIcons.Clock,
  'clipboard-list': LucideIcons.ClipboardList,
  'user-check': LucideIcons.UserCheck,
  'folder-open': LucideIcons.FolderOpen,
  heart: LucideIcons.Heart,
  star: LucideIcons.Star,
  lock: LucideIcons.Lock,
  shield: LucideIcons.Shield,
}

type Props = {
  iconName?: NavIconName
  className?: string
}

export function NavbarIcon({ iconName, className }: Props) {
  if (isNil(iconName)) {
    return null
  }
  const Icon = iconMap[iconName] ?? null
  if (isNil(Icon)) {
    return null
  }
  return <Icon className={className} />
}
