import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { err, isErr, ok, Result } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'
import { FileObject } from '@supabase/storage-js'

export type Bucket = {
  name: string
  folders: {
    name: string
    slug: string
  }[]
}

/**
 * Fetches all buckets and their folders from Supabase storage
 */
export async function getBuckets(): Promise<Bucket[]> {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error('Error fetching buckets:', bucketsError)
    return []
  }

  const bucketsWithFolders = await Promise.all(
    buckets.map(async (bucket) => {
      const { data: folders, error: foldersError } = await supabase.storage
        .from(bucket.name)
        .list()

      if (foldersError) {
        logger.error(
          `Error fetching folders for bucket ${bucket.name}:`,
          foldersError
        )
        return { name: bucket.name, folders: [] }
      }

      return {
        name: bucket.name,
        folders: folders
          .filter((item) => item.metadata === null) // folders have null mimetype
          .map((folder) => ({
            name: folder.name,
            slug: slugify(folder.name),
          })),
      }
    })
  )

  return bucketsWithFolders
}

/**
 * Fetches file system items from a specific bucket and path
 */
export async function getFileSystemItems(
  bucket: string = 'files',
  path: string = ''
): Promise<Result<string, FileObject[]>> {
  const supabase = await createClient()
  const { data: items, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    return err(`Error fetching items for ${bucket}/${path}: ${error.message}`)
  }

  return ok(
    items
      .filter((item) => item.name !== '.placeholder') // Filter out placeholder files
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}

/**
 * Validates folder path and fetches contents
 */
export async function fetchFolderContents(
  pathSegments: string[]
): Promise<Result<string, Array<FileObject>>> {
  if (pathSegments.length === 0) return ok([])
  const folderPath = pathSegments.map(unslugify)

  const supabase = await createClient()
  let currentPath = ''

  for (const segment of folderPath) {
    const { data: items, error } = await supabase.storage
      .from('files')
      .list(currentPath)

    if (error) {
      return err(`Error validating path segment ${segment}: ${error.message}`)
    }

    const folderExists = items.some(
      // Looking for the next folder in the path segment in supabase file bucket
      (item) => item.metadata === null && item.name === segment
    )

    if (!folderExists) {
      return err(`Cannot find ${segment} in files/${currentPath}`)
    }

    currentPath = currentPath ? `${currentPath}/${segment}` : segment
  }

  return getFileSystemItems('files', currentPath)
}

/**
 * Get navigation items for file folders (useful for sidebar/menu generation)
 */
export async function getFileFolders(isAdmin: boolean = false) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage.from('files').list('')

    if (error) {
      logger.error('Error fetching root folders:', error)
      return []
    }

    const baseUrl = isAdmin ? '/admin/files' : '/files'

    return data
      .filter((item) => item.metadata === null)
      .map((item) => ({
        title:
          item.name.charAt(0).toUpperCase() +
          item.name.slice(1).replace(/-/g, ' '),
        url: `${baseUrl}/${slugify(item.name)}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    logger.error('Error in getFileFolders:', error)
    return []
  }
}
