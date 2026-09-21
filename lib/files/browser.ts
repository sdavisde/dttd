import { isNil } from 'lodash'
import type { FileObject } from '@supabase/storage-js'
import { err, ok, type Result } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'

/**
 * Pure helpers behind the admin Files browser: telling folders from files,
 * resolving URL slugs back to real storage names, and shaping list rows.
 */

export const PLACEHOLDER_FILE_NAME = '.placeholder'

export type FileBrowserEntry = {
  kind: 'folder' | 'file'
  name: string
  /** Full path inside the bucket, e.g. `Team Handbooks/2025/guide.pdf` */
  storagePath: string
  /** URL slugs from the Files root; only meaningful for folders */
  slugs: string[]
  updatedAt: string | null
  size: number | null
  /**
   * Folder this file lives in. Only set by the flat "All files" listing;
   * null for files sitting at the bucket root.
   */
  folder?: FolderCrumb | null
}

/** A file found while walking the bucket, paired with its folder. */
export type FlatStorageFile = {
  /** Folder path inside the bucket; '' for files at the bucket root */
  folderPath: string
  item: FileObject
}

export type FolderCrumb = {
  name: string
  slugs: string[]
}

export type RootFolder = {
  name: string
  slug: string
}

/** Supabase Storage lists folders as entries without metadata. */
export function isFolderObject(item: FileObject): boolean {
  return isNil(item.metadata)
}

export function joinStoragePath(parent: string, name: string): string {
  return parent === '' ? name : `${parent}/${name}`
}

/**
 * Finds the folder a URL segment points at. Slugs are lossy (case, punctuation),
 * so match on the slug of the real name first and fall back to the legacy
 * title-cased guess.
 */
export function findFolderBySlug(
  items: FileObject[],
  segment: string
): FileObject | undefined {
  const folders = items.filter(isFolderObject)
  return (
    folders.find((item) => slugify(item.name) === segment) ??
    folders.find((item) => item.name === unslugify(segment))
  )
}

/** Shapes a storage listing into browser rows: folders first, then files. */
export function toBrowserEntries(
  items: FileObject[],
  parentStoragePath: string,
  parentSlugs: string[]
): FileBrowserEntry[] {
  const entries = items
    .filter((item) => item.name !== PLACEHOLDER_FILE_NAME)
    .map((item): FileBrowserEntry => {
      const isFolder = isFolderObject(item)
      const size = item.metadata?.size
      return {
        kind: isFolder ? 'folder' : 'file',
        name: item.name,
        storagePath: joinStoragePath(parentStoragePath, item.name),
        slugs: isFolder ? [...parentSlugs, slugify(item.name)] : parentSlugs,
        updatedAt: item.updated_at ?? item.created_at ?? null,
        size: !isFolder && typeof size === 'number' ? size : null,
      }
    })

  const byName = (a: FileBrowserEntry, b: FileBrowserEntry) =>
    a.name.localeCompare(b.name)

  return [
    ...entries.filter((entry) => entry.kind === 'folder').sort(byName),
    ...entries.filter((entry) => entry.kind === 'file').sort(byName),
  ]
}

/** Turns `Team Handbooks/2025` into the URL slugs that reach it. */
export function folderPathSlugs(folderPath: string): string[] {
  return folderPath === '' ? [] : folderPath.split('/').map(slugify)
}

const updatedAtMillis = (entry: FileBrowserEntry): number => {
  if (isNil(entry.updatedAt)) return 0
  const parsed = Date.parse(entry.updatedAt)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Flattens a whole-bucket walk into the "All files" listing: every file, most
 * recently updated first, tagged with the folder it came from.
 */
export function toAllFilesEntries(
  files: FlatStorageFile[]
): FileBrowserEntry[] {
  return files
    .filter(
      ({ item }) => item.name !== PLACEHOLDER_FILE_NAME && !isFolderObject(item)
    )
    .map(({ folderPath, item }): FileBrowserEntry => {
      const size = item.metadata?.size
      const slugs = folderPathSlugs(folderPath)
      return {
        kind: 'file',
        name: item.name,
        storagePath: joinStoragePath(folderPath, item.name),
        slugs,
        updatedAt: item.updated_at ?? item.created_at ?? null,
        size: typeof size === 'number' ? size : null,
        folder: folderPath === '' ? null : { name: folderPath, slugs },
      }
    })
    .sort((a, b) => {
      const byNewest = updatedAtMillis(b) - updatedAtMillis(a)
      return byNewest === 0 ? a.name.localeCompare(b.name) : byNewest
    })
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

/** "2 folders and 5 files in Team handbooks" */
export function describeFolderContents(
  entries: FileBrowserEntry[],
  folderLabel: string
): string {
  const folders = entries.filter((entry) => entry.kind === 'folder').length
  const files = entries.length - folders
  return `${pluralize(folders, 'folder')} and ${pluralize(files, 'file')} in ${folderLabel}`
}

/** "12 files across 3 folders" — the caption for the flat "All files" view. */
export function describeAllFiles(entries: FileBrowserEntry[]): string {
  const folders = new Set(
    entries
      .map((entry) => entry.folder?.name)
      .filter((name): name is string => !isNil(name))
  )
  return `${pluralize(entries.length, 'file')} across ${pluralize(folders.size, 'folder')}`
}

export function adminFilesHref(slugs: string[]): string {
  return slugs.length === 0 ? '/admin/files' : `/admin/files/${slugs.join('/')}`
}

/** Validates and trims a new folder name. */
export function validateFolderName(name: string): Result<string, string> {
  const trimmed = name.trim()
  if (trimmed === '') {
    return err('Give the folder a name.')
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return err(
      'Folder names can only use letters, numbers, spaces, dashes, and underscores.'
    )
  }
  return ok(trimmed)
}
