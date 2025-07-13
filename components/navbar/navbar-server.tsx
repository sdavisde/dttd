import { createClient } from '@/lib/supabase/server'
import { Navbar } from './navbar-client'
import { logger } from '@/lib/logger'
import { slugify } from '@/util/url'

async function getNavElements() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error('Error fetching buckets:', bucketsError)
    return []
  }

  const bucketStructure = await Promise.all(
    buckets.map(async (bucket) => {
      const { data: folders, error: foldersError } = await supabase.storage.from(bucket.name).list()

      if (foldersError) {
        logger.error(`Error fetching folders for bucket ${bucket.name}:`, foldersError)
        return {
          name: bucket.name,
          slug: slugify(bucket.name),
          permissions_needed: [] as string[],
          children: [],
        }
      }

      return {
        name: bucket.name,
        slug: slugify(bucket.name),
        permissions_needed: [] as string[],
        children: folders
          .filter((item) => item.metadata === null) // folders have null mimetype
          .map((folder) => ({
            name: folder.name,
            slug: slugify(folder.name),
            permissions_needed: [] as string[],
          })),
      }
    })
  )

  // Add static navigation elements
  const staticNavElements = [
    {
      name: 'Sponsorship',
      slug: 'sponsor',
      permissions_needed: [] as string[],
    },
    {
      name: 'Candidates',
      slug: 'review-candidate',
      permissions_needed: ['FULL_ACCESS'],
    },
    {
      name: 'Settings',
      slug: 'settings',
      permissions_needed: ['FULL_ACCESS'],
    },
    {
      name: 'Roster',
      slug: 'roster',
      permissions_needed: ['FULL_ACCESS'],
    },
  ]

  return [...bucketStructure, ...staticNavElements]
}

export async function NavbarServer() {
  const navElements = await getNavElements()

  return <Navbar navElements={navElements} />
}
