import { createClient } from '@/lib/supabase/server'
import { Navbar } from './navbar-client'
import { logger } from '@/lib/logger'
import { Permission } from '@/lib/security'

export type NavElement = {
  name: string
  slug: string
  permissions_needed: Array<Permission>
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
    },
    {
      name: 'Community',
      slug: 'community',
      permissions_needed: [],
      children: [
        {
          name: 'Files',
          slug: 'files',
          permissions_needed: [],
        },
      ],
    },
    {
      name: 'Current Weekend',
      slug: 'current-weekend',
      permissions_needed: [],
      children: [
        {
          name: 'Review Candidates',
          slug: 'review-candidates',
          permissions_needed: [Permission.READ_CANDIDATES],
        },
        {
          name: 'Roster',
          slug: 'roster',
          permissions_needed: [],
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
