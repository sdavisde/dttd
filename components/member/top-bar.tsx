import type { MemberNav } from '@/lib/member/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SearchPalette } from '@/components/member/search-palette'
import { AccountMenu } from '@/components/member/account-menu'

type TopBarProps = {
  nav: MemberNav
  showAdmin: boolean
}

/**
 * The 56px bar above every member page (CandidateReviewA board): sidebar
 * toggle on the left, search and the account menu on the right. Sticky so the
 * search and account are always one tap away on long pages.
 */
export function TopBar({ nav, showAdmin }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 md:px-6">
      <SidebarTrigger className="hidden size-9 text-muted-foreground md:inline-flex" />
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <SearchPalette nav={nav} />
        <AccountMenu showAdmin={showAdmin} />
      </div>
    </header>
  )
}
