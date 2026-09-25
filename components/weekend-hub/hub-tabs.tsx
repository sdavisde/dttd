'use client'

import { usePathname } from 'next/navigation'
import { IntentLink } from '@/components/ui/intent-link'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { HUB_TABS, hubPath, hubTabFromPath } from '@/lib/weekend/hub'
import { WeekendType } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

type HubNavProps = {
  groupId: string
  weekendType: WeekendType
}

/**
 * The hub's section row (Overview · Schedule · Team · Candidates). It lives
 * in the hub layout, so it reads the active tab from the URL rather than
 * from the page — the highlight moves the instant a tab is clicked, while
 * the page body is still loading. Scrolls sideways on phones rather than
 * wrapping under the header. Tabs prefetch their page (data included) on
 * hover / focus / touch, not on sight, so a tab the viewer reaches for is
 * usually already in the router cache.
 */
export function HubTabs({ groupId, weekendType }: HubNavProps) {
  const active = hubTabFromPath(usePathname())
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
              <IntentLink
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
              </IntentLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** The Men's / Women's switch; keeps the viewer on the tab they're on. */
export function HubWeekendSwitch({ groupId, weekendType }: HubNavProps) {
  const tab = hubTabFromPath(usePathname()) ?? 'overview'
  return (
    <SegmentedControl
      aria-label="Weekend"
      value={weekendType}
      options={[
        {
          value: WeekendType.MENS,
          label: "Men's",
          href: hubPath(groupId, tab, WeekendType.MENS),
        },
        {
          value: WeekendType.WOMENS,
          label: "Women's",
          href: hubPath(groupId, tab, WeekendType.WOMENS),
        },
      ]}
    />
  )
}
