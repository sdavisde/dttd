import { isNil } from 'lodash'
import { logger } from '@/lib/logger'
import type { Result } from '@/lib/results'
import { err, isErr, ok, Results } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'
import type { FileObject } from '@supabase/storage-js'
import type {
  MeetingMinuteFile,
  PagedFileItems,
  PagedMeetingMinuteFiles,
  StorageSortDirection,
  StorageSortField,
} from '@/lib/files/types'
import {
  COMMUNITY_FILES_BUCKET,
  MEETING_MINUTES_FOLDER,
} from '@/lib/files/constants'
import {
  findFolderBySlug,
  isFolderObject,
  joinStoragePath,
  toAllFilesEntries,
  toBrowserEntries,
  validateFolderName,
  type FileBrowserEntry,
  type FlatStorageFile,
  type FolderCrumb,
  type RootFolder,
} from '@/lib/files/browser'
import { isAllowedFileExtension } from '@/lib/files/validation'
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
  if (files.length === 0) return []

  const storagePaths = files.map((file) => `${path}/${file.name}`)
  const { data, error } =
    await FileRepository.getMeetingMinutesLocations(storagePaths)

  if (!isNil(error)) {
    logger.error(`Error fetching meeting minutes locations: ${error.message}`)
  }

  const locationByPath = new Map(
    (data ?? []).map((row) => [row.storage_path, row.location])
  )

  return files.map((file) => ({
    ...file,
    location: locationByPath.get(`${path}/${file.name}`) ?? undefined,
  }))
}

export async function saveMeetingMinutesLocation(
  fileName: string,
  location: string
): Promise<Result<string, null>> {
  const storagePath = `${MEETING_MINUTES_FOLDER}/${fileName}`
  const { error } = await FileRepository.upsertMeetingMinutesLocation(
    storagePath,
    location
  )

  if (!isNil(error)) {
    return err(error.message)
  }

  return ok(null)
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

export async function createUploadUrl(
  folder: string,
  fileName: string
): Promise<Result<string, { bucket: string; path: string; token: string }>> {
  if (!isAllowedFileExtension(fileName)) {
    return err('Only PDF and image files are allowed')
  }

  const { data, error } = await FileRepository.createSignedUploadUrl(
    'files',
    `${folder}/${fileName}`
  )

  if (!isNil(error) || isNil(data)) {
    return err(error?.message ?? 'Unable to create upload URL')
  }

  return ok({ bucket: 'files', path: data.path, token: data.token })
}

export async function getFilePublicUrl(
  folder: string,
  fileName: string
): Promise<Result<string, { publicUrl: string }>> {
  const { data } = await FileRepository.getPublicUrl(
    'files',
    `${folder}/${fileName}`
  )
  return ok({ publicUrl: data.publicUrl })
}

export async function getFileDownloadUrl(
  folder: string,
  fileName: string,
  expiresIn: number = 60
): Promise<Result<string, { downloadUrl: string }>> {
  const { data, error } = await FileRepository.createSignedUrl(
    'files',
    `${folder}/${fileName}`,
    expiresIn
  )

  if (!isNil(error) || isNil(data)) {
    return err(`Failed to create download URL: ${error?.message}`)
  }

  return ok({ downloadUrl: data.signedUrl })
}

export type AdminFolderView = {
  /** Real path inside the bucket; '' for the root */
  storagePath: string
  /** One crumb per folder from the root down to the viewed folder */
  trail: FolderCrumb[]
  entries: FileBrowserEntry[]
}

/** Top-level folders of the community files bucket (the admin folder rail). */
export async function getRootFolders(): Promise<Result<string, RootFolder[]>> {
  const items = await getFileSystemItems(COMMUNITY_FILES_BUCKET, '')
  return Results.map(items, (list) =>
    list.filter(isFolderObject).map((item) => ({
      name: item.name,
      slug: slugify(item.name),
    }))
  )
}

/**
 * Resolves URL slugs to the real folder path in the community files bucket and
 * lists what is inside, with folders and files told apart. Admin-only sibling
 * of `fetchFolderContents`, which the public route keeps using unchanged.
 */
export async function getAdminFolderView(
  pathSegments: string[]
): Promise<Result<string, AdminFolderView>> {
  let storagePath = ''
  const trail: FolderCrumb[] = []

  for (const segment of pathSegments) {
    const items = await getFileSystemItems(COMMUNITY_FILES_BUCKET, storagePath)
    if (isErr(items)) return items

    const match = findFolderBySlug(items.data, segment)
    if (isNil(match)) {
      return err(`Cannot find ${segment} in files/${storagePath}`)
    }

    storagePath = joinStoragePath(storagePath, match.name)
    trail.push({
      name: match.name,
      slugs: [...(trail.at(-1)?.slugs ?? []), slugify(match.name)],
    })
  }

  const contents = await getFileSystemItems(COMMUNITY_FILES_BUCKET, storagePath)
  return Results.map(contents, (items) => ({
    storagePath,
    trail,
    entries: toBrowserEntries(items, storagePath, trail.at(-1)?.slugs ?? []),
  }))
}

/** How far down the bucket the "All files" walk will go before stopping. */
const MAX_WALK_DEPTH = 8

/**
 * Walks the community bucket depth-first and returns every file with the folder
 * it lives in. Each listing is paginated, since Supabase's `list()` returns at
 * most 100 items per call.
 */
async function collectFilesRecursive(
  folderPath: string,
  depth: number
): Promise<Result<string, FlatStorageFile[]>> {
  if (depth > MAX_WALK_DEPTH) return ok([])

  const pageSize = 100
  const files: FlatStorageFile[] = []
  let offset = 0

  while (true) {
    const { data: items, error } = await FileRepository.listFiles(
      COMMUNITY_FILES_BUCKET,
      folderPath,
      { limit: pageSize, offset }
    )
    if (!isNil(error)) {
      return err(`Error listing files/${folderPath}: ${error.message}`)
    }

    const pageItems = items ?? []
    for (const item of pageItems) {
      if (isFolderObject(item)) {
        const nested = await collectFilesRecursive(
          joinStoragePath(folderPath, item.name),
          depth + 1
        )
        if (isErr(nested)) return nested
        files.push(...nested.data)
      } else {
        files.push({ folderPath, item })
      }
    }

    if (pageItems.length < pageSize) break
    offset += pageSize
  }

  return ok(files)
}

/**
 * Every file in the community bucket, flattened and newest first — what the
 * "All files" rail entry shows. Shares `AdminFolderView` so the page renders
 * the root and a folder the same way.
 */
export async function getAdminAllFilesView(): Promise<
  Result<string, AdminFolderView>
> {
  const files = await collectFilesRecursive('', 0)
  return Results.map(files, (list) => ({
    storagePath: '',
    trail: [],
    entries: toAllFilesEntries(list),
  }))
}

export async function createFolder(
  parentPath: string,
  name: string
): Promise<Result<string, { storagePath: string }>> {
  const validName = validateFolderName(name)
  if (isErr(validName)) return validName

  const storagePath = joinStoragePath(parentPath, validName.data)
  const { error } = await FileRepository.uploadPlaceholder(
    COMMUNITY_FILES_BUCKET,
    storagePath
  )

  if (!isNil(error)) {
    return err(
      error.message.includes('already exists')
        ? 'A folder with this name already exists.'
        : error.message
    )
  }

  return ok({ storagePath })
}

/** Every object path under a folder, placeholders and sub-folders included. */
async function collectObjectPaths(
  folderPath: string
): Promise<Result<string, string[]>> {
  const pageSize = 100
  const paths: string[] = []
  let offset = 0

  while (true) {
    const { data: items, error } = await FileRepository.listFiles(
      COMMUNITY_FILES_BUCKET,
      folderPath,
      { limit: pageSize, offset }
    )
    if (!isNil(error)) return err(error.message)

    const pageItems = items ?? []
    for (const item of pageItems) {
      const itemPath = joinStoragePath(folderPath, item.name)
      if (isFolderObject(item)) {
        const nested = await collectObjectPaths(itemPath)
        if (isErr(nested)) return nested
        paths.push(...nested.data)
      } else {
        paths.push(itemPath)
      }
    }

    if (pageItems.length < pageSize) break
    offset += pageSize
  }

  return ok(paths)
}

export async function deleteFile(
  storagePath: string
): Promise<Result<string, null>> {
  if (storagePath.trim() === '') return err('A file is required')

  const { error } = await FileRepository.removeFiles(COMMUNITY_FILES_BUCKET, [
    storagePath,
  ])
  return isNil(error) ? ok(null) : err(error.message)
}

/** Deletes a folder and everything beneath it. */
export async function deleteFolderRecursive(
  storagePath: string
): Promise<Result<string, { removed: number }>> {
  if (storagePath.trim() === '') return err('A folder is required')

  const paths = await collectObjectPaths(storagePath)
  if (isErr(paths)) return paths
  if (paths.data.length === 0) return ok({ removed: 0 })

  const { error } = await FileRepository.removeFiles(
    COMMUNITY_FILES_BUCKET,
    paths.data
  )
  return isNil(error) ? ok({ removed: paths.data.length }) : err(error.message)
}
