import { isNil } from 'lodash'
import { logger } from '@/lib/logger'
import type { Result } from '@/lib/results'
import { err, isErr, ok } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'
import type { FileObject } from '@supabase/storage-js'
import type {
  MeetingMinuteFile,
  PagedFileItems,
  PagedMeetingMinuteFiles,
  StorageSortDirection,
  StorageSortField,
} from '@/lib/files/types'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import * as FileRepository from './repository'

export type Bucket = {
  name: string
  folders: {
    name: string
    slug: string
  }[]
}

export async function getBuckets(): Promise<Bucket[]> {
  const { data: buckets, error: bucketsError } =
    await FileRepository.listBuckets()

  if (!isNil(bucketsError) || isNil(buckets)) {
    logger.error(`Error fetching buckets: ${bucketsError?.message}`)
    return []
  }

  return Promise.all(
    buckets.map(async (bucket) => {
      const { data: folders, error: foldersError } =
        await FileRepository.listFiles(bucket.name, '')

      if (!isNil(foldersError) || isNil(folders)) {
        logger.error(
          `Error fetching folders for bucket ${bucket.name}: ${foldersError?.message}`
        )
        return { name: bucket.name, folders: [] }
      }

      return {
        name: bucket.name,
        folders: folders
          .filter((item) => item.metadata === null)
          .map((folder) => ({
            name: folder.name,
            slug: slugify(folder.name),
          })),
      }
    })
  )
}

export async function getFileSystemItems(
  bucket: string = 'files',
  path: string = ''
): Promise<Result<string, FileObject[]>> {
  const pageSize = 100
  const allItems: FileObject[] = []
  let offset = 0

  while (true) {
    const { data: items, error } = await FileRepository.listFiles(
      bucket,
      path,
      {
        limit: pageSize,
        offset,
      }
    )

    if (!isNil(error)) {
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
    FileRepository.filterPlaceholderFiles(allItems).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  )
}

export async function fetchFolderContents(
  pathSegments: string[]
): Promise<Result<string, Array<FileObject>>> {
  if (pathSegments.length === 0) return ok([])
  const folderPath = pathSegments.map(unslugify)

  let currentPath = ''

  for (const segment of folderPath) {
    const { data: items, error } = await FileRepository.listFiles(
      'files',
      currentPath
    )

    if (!isNil(error) || isNil(items)) {
      return err(`Error validating path segment ${segment}: ${error?.message}`)
    }

    const folderExists = items.some(
      (item) => item.metadata === null && item.name === segment
    )

    if (!folderExists) {
      return err(`Cannot find ${segment} in files/${currentPath}`)
    }

    currentPath = currentPath !== '' ? `${currentPath}/${segment}` : segment
  }

  return getFileSystemItems('files', currentPath)
}

export async function getMeetingMinutesFiles(): Promise<
  Result<string, FileObject[]>
> {
  return getFileSystemItems('files', MEETING_MINUTES_FOLDER)
}

export async function getFileSystemItemsPage(
  bucket: string = 'files',
  path: string = '',
  page: number = 1,
  pageSize: number = 10,
  sortField: StorageSortField = 'created_at',
  sortDirection: StorageSortDirection = 'desc'
): Promise<Result<string, PagedFileItems>> {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const currentOffset = (safePage - 1) * safePageSize
  const nextOffset = currentOffset + safePageSize

  const [currentPageResult, nextPageResult] = await Promise.all([
    FileRepository.listFilesPage(bucket, path, safePageSize, currentOffset, {
      column: sortField,
      order: sortDirection,
    }),
    FileRepository.listFilesPage(bucket, path, safePageSize, nextOffset, {
      column: sortField,
      order: sortDirection,
    }),
  ])

  if (!isNil(currentPageResult.error)) {
    return err(
      `Error fetching page ${safePage} for ${bucket}/${path}: ${currentPageResult.error.message}`
    )
  }

  if (!isNil(nextPageResult.error)) {
    return err(
      `Error fetching page ${safePage + 1} for ${bucket}/${path}: ${nextPageResult.error.message}`
    )
  }

  return ok({
    page: safePage,
    pageSize: safePageSize,
    sortField,
    sortDirection,
    currentPageItems: FileRepository.filterPlaceholderFiles(
      currentPageResult.data
    ),
    nextPageItems: FileRepository.filterPlaceholderFiles(nextPageResult.data),
  })
}

async function enrichWithLocation(
  files: FileObject[],
  path: string
): Promise<MeetingMinuteFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const { data } = await FileRepository.getFileInfo(
        'files',
        `${path}/${file.name}`
      )

      return {
        ...file,
        location: (data?.metadata?.location as string) ?? undefined,
      }
    })
  )
}

export async function getMeetingMinutesPage(
  page: number = 1,
  pageSize: number = 10,
  sortField: StorageSortField = 'created_at',
  sortDirection: StorageSortDirection = 'desc'
): Promise<Result<string, PagedMeetingMinuteFiles>> {
  const result = await getFileSystemItemsPage(
    'files',
    MEETING_MINUTES_FOLDER,
    page,
    pageSize,
    sortField,
    sortDirection
  )

  if (isErr(result)) return result

  const [enrichedCurrent, enrichedNext] = await Promise.all([
    enrichWithLocation(result.data.currentPageItems, MEETING_MINUTES_FOLDER),
    enrichWithLocation(result.data.nextPageItems, MEETING_MINUTES_FOLDER),
  ])

  return ok({
    ...result.data,
    currentPageItems: enrichedCurrent,
    nextPageItems: enrichedNext,
  })
}

export async function uploadFile({
  folder,
  file,
  metadata,
}: {
  folder: string
  file: File
  metadata?: Record<string, string>
}): Promise<Result<string, { fileName: string }>> {
  const { error } = await FileRepository.uploadFile(
    'files',
    `${folder}/${file.name}`,
    file,
    {
      cacheControl: '3600',
      upsert: false,
      metadata,
    }
  )

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok({ fileName: file.name })
}

export async function getFileFolders(isAdmin: boolean = false) {
  try {
    const { data, error } = await FileRepository.listFiles('files', '')

    if (!isNil(error) || isNil(data)) {
      logger.error(`Error fetching root folders: ${error?.message}`)
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
