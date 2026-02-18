import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { err, ok, Result } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'
import { FileObject } from '@supabase/storage-js'
import { PagedFileItems, StorageSortDirection, StorageSortField } from './types'

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
    logger.error(`Error fetching buckets: ${bucketsError.message}`)
    return []
  }

  const bucketsWithFolders = await Promise.all(
    buckets.map(async (bucket) => {
      const { data: folders, error: foldersError } = await supabase.storage
        .from(bucket.name)
        .list()

      if (foldersError) {
        logger.error(
          `Error fetching folders for bucket ${bucket.name}: ${foldersError.message}`
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
  const pageSize = 100
  const allItems: FileObject[] = []
  let offset = 0

  while (true) {
    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: pageSize,
        offset,
      })

    if (error) {
      return err(`Error fetching items for ${bucket}/${path}: ${error.message}`)
    }

    const pageItems = items ?? []
    allItems.push(...pageItems)

    if (pageItems.length < pageSize) {
      break
    }

    offset += pageSize
  }

  return ok(
    allItems
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

import { MEETING_MINUTES_FOLDER } from './constants'

// Re-export constants for server-side usage
export { MEETING_MINUTES_FOLDER } from './constants'

/**
 * Fetches meeting minutes files from the Meeting Minutes folder
 */
export async function getMeetingMinutesFiles(): Promise<
  Result<string, FileObject[]>
> {
  return getFileSystemItems('files', MEETING_MINUTES_FOLDER)
}

/**
 * Fetches one page plus the next page for efficient forward pagination.
 */
export async function getFileSystemItemsPage(
  bucket: string = 'files',
  path: string = '',
  page: number = 1,
  pageSize: number = 10,
  sortField: StorageSortField = 'created_at',
  sortDirection: StorageSortDirection = 'desc'
): Promise<Result<string, PagedFileItems>> {
  const supabase = await createClient()
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const currentOffset = (safePage - 1) * safePageSize
  const nextOffset = currentOffset + safePageSize

  const [currentPageResult, nextPageResult] = await Promise.all([
    supabase.storage.from(bucket).list(path, {
      limit: safePageSize,
      offset: currentOffset,
      sortBy: { column: sortField, order: sortDirection },
    }),
    supabase.storage.from(bucket).list(path, {
      limit: safePageSize,
      offset: nextOffset,
      sortBy: { column: sortField, order: sortDirection },
    }),
  ])

  if (currentPageResult.error) {
    return err(
      `Error fetching page ${safePage} for ${bucket}/${path}: ${currentPageResult.error.message}`
    )
  }

  if (nextPageResult.error) {
    return err(
      `Error fetching page ${safePage + 1} for ${bucket}/${path}: ${nextPageResult.error.message}`
    )
  }

  const sanitize = (items: FileObject[] | null) =>
    (items ?? []).filter((item) => item.name !== '.placeholder')

  return ok({
    page: safePage,
    pageSize: safePageSize,
    sortField,
    sortDirection,
    currentPageItems: sanitize(currentPageResult.data),
    nextPageItems: sanitize(nextPageResult.data),
  })
}

/**
 * Fetches one meeting-minutes page plus the subsequent page.
 */
export async function getMeetingMinutesPage(
  page: number = 1,
  pageSize: number = 10,
  sortField: StorageSortField = 'created_at',
  sortDirection: StorageSortDirection = 'desc'
): Promise<Result<string, PagedFileItems>> {
  return getFileSystemItemsPage(
    'files',
    MEETING_MINUTES_FOLDER,
    page,
    pageSize,
    sortField,
    sortDirection
  )
}

/**
 * Get navigation items for file folders (useful for sidebar/menu generation)
 */
export async function getFileFolders(isAdmin: boolean = false) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage.from('files').list('')

    if (error) {
      logger.error(`Error fetching root folders: ${error.message}`)
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
    logger.error(
      `Error in getFileFolders: ${error instanceof Error ? error.message : String(error)}`
    )
    return []
  }
}
