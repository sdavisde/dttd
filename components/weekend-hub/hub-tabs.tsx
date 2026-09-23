import Link from 'next/link'
import { HUB_TABS, hubPath, type HubTab } from '@/lib/weekend/hub'
import type { WeekendType } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

type HubTabsProps = {
  groupId: string
  weekendType: WeekendType
  active: HubTab
}

/**
 * The hub's section row (Overview · Schedule · Team · Candidates). Plain links
 * that carry the weekend selection along; scrolls sideways on phones rather
 * than wrapping under the header.
 */
export function HubTabs({ groupId, weekendType, active }: HubTabsProps) {
  return (
    <nav
      aria-label="Weekend sections"
      className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-6 border-b border-border md:gap-7">
        {HUB_TABS.map(({ tab, label }) => {
          const isActive = tab === active
          return (
            <li key={tab}>
              <Link
                href={hubPath(groupId, tab, weekendType)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  '-mb-px flex min-h-11 items-center border-b-2 px-0.5 text-sm transition-colors',
                  isActive
                    ? 'border-primary font-semibold text-foreground'
                    : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
