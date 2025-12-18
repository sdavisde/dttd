import { createClient } from '@/lib/supabase/server'
import { Navbar } from './navbar-client'
import { logger } from '@/lib/logger'
import { Permission } from '@/lib/security'

async function getNavElements() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error(`Error fetching buckets: ${bucketsError.message}`)
    return []
  }

  // Add static navigation elements
  const staticNavElements = [
    {
      name: 'Home',
      slug: 'home',
      permissions_needed: [],
    },
    {
      name: 'Files',
      slug: 'files',
      permissions_needed: [],
    },
    {
      name: 'Candidates',
      slug: 'review-candidates',
      permissions_needed: [Permission.READ_CANDIDATES],
    },
    {
      name: 'Roster',
      slug: 'roster',
      permissions_needed: [],
    },
    {
      name: 'Admin',
      slug: 'admin',
      permissions_needed: [Permission.READ_ADMIN_PORTAL],
    },
  ]

  return [
    // ...bucketStructure,
    ...staticNavElements,
  ]
}

export async function NavbarServer() {
  const navElements = await getNavElements()

  return <Navbar navElements={navElements} />
}
