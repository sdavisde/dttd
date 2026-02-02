import { createClient } from '@/lib/supabase/server'
import { Navbar } from './navbar-client'
import { logger } from '@/lib/logger'
import { Permission } from '@/lib/security'

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

export type NavElement = {
  name: string
  slug: string
  permissions_needed: Array<Permission>
  description?: string
  icon?: NavIconName
  children?: NavElement[]
}

async function getNavElements(): Promise<NavElement[]> {
  const supabase = await createClient()
  const { error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error(`Error fetching buckets: ${bucketsError.message}`)
    return []
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
      children: [
        {
          name: 'Review Candidates',
          slug: 'review-candidates',
          permissions_needed: [Permission.READ_CANDIDATES],
          description: 'Review and approve candidate applications',
          icon: 'clipboard-list',
        },
        {
          name: 'Roster',
          slug: 'roster',
          permissions_needed: [],
          description: 'View team assignments and participant lists',
          icon: 'users',
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
