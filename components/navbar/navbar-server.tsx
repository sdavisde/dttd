import { createClient } from '@/lib/supabase/server'
import { Navbar } from './navbar-client'
import { logger } from '@/lib/logger'
import { Permission } from '@/lib/security'
import { getActiveWeekends } from '@/services/weekend'
import { isOk } from '@/lib/results'
import { WeekendType } from '@/lib/weekend/types'

// Icon names that map to lucide-react icons in the client component
export type NavIconName =
  | 'home'
  | 'calendar'
  | 'users'
  | 'file-text'
  | 'clock'
  | 'clipboard-list'
  | 'user-check'
  | 'folder-open'
  | 'heart'
  | 'star'
  | 'lock'
  | 'shield'

// Featured content to display in a dropdown panel
export type NavFeaturedContent = {
  title: string
  description: string
  linkText: string
  linkHref: string
}

export type NavElement = {
  name: string
  slug: string
  permissions_needed: Array<Permission>
  description?: string
  icon?: NavIconName
  children?: NavElement[]
  featured?: NavFeaturedContent
  // Visual indicator for restricted/special items
  badge?: 'restricted' | 'new'
}

async function getNavElements(): Promise<NavElement[]> {
  const supabase = await createClient()
  const { error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error(`Error fetching buckets: ${bucketsError.message}`)
    return []
  }

  // Fetch active weekends for the featured content
  const weekendsResult = await getActiveWeekends()
  let featuredContent: NavFeaturedContent | undefined

  if (isOk(weekendsResult)) {
    const weekends = weekendsResult.data
    const mensWeekend = weekends[WeekendType.MENS]
    const womensWeekend = weekends[WeekendType.WOMENS]

    // Format dates for display
    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const mensDateStr = mensWeekend
      ? `Men's: ${formatDate(new Date(mensWeekend.start_date))}`
      : null
    const womensDateStr = womensWeekend
      ? `Women's: ${formatDate(new Date(womensWeekend.start_date))}`
      : null

    const dateDescription = [mensDateStr, womensDateStr]
      .filter(Boolean)
      .join(' • ')

    featuredContent = {
      title: `DTTD #${mensWeekend.number}`,
      description: dateDescription || 'View details and sign up',
      linkText: 'View weekend details',
      linkHref: '/current-weekend',
    }
  }

  const navElements: NavElement[] = [
    {
      name: 'Home',
      slug: 'home',
      permissions_needed: [],
      description: 'Return to the main dashboard',
      icon: 'home',
    },
    {
      name: 'Community',
      slug: 'community',
      permissions_needed: [],
      description: 'Connect with the DTTD community',
      icon: 'heart',
      children: [
        {
          name: 'Files & Documents',
          slug: 'files',
          permissions_needed: [],
          description: 'Access shared documents, guides, and resources',
          icon: 'file-text',
        },
      ],
    },
    {
      name: 'Current Weekend',
      slug: 'current-weekend',
      permissions_needed: [],
      description: 'Information about the active weekend',
      icon: 'calendar',
      featured: featuredContent,
      children: [
        {
          name: 'Team Roster',
          slug: 'roster',
          permissions_needed: [],
          description: 'View team assignments and participant lists',
          icon: 'users',
        },
        {
          name: 'Candidate List',
          slug: 'candidate-list',
          permissions_needed: [],
          description: 'View basic candidate information',
          icon: 'user-check',
        },
        {
          name: 'Review Candidates',
          slug: 'review-candidates',
          permissions_needed: [Permission.READ_CANDIDATES],
          description: 'Review and approve candidate applications',
          icon: 'clipboard-list',
          badge: 'restricted',
        },
      ],
    },
  ]

  return navElements
}

export async function NavbarServer() {
  const navElements = await getNavElements()

  return <Navbar navElements={navElements} />
}
