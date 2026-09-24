import { isNil } from 'lodash'
import type { FileObject } from '@supabase/storage-js'
import { err, ok, type Result } from '@/lib/results'
import { slugify, unslugify } from '@/lib/url'

/**
 * Pure helpers behind the Files browser (admin Files and member Documents): telling folders from files,
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

/**
 * Which Files browser a link belongs to: the admin back office (manage) or the
 * member Documents page (browse only).
 */
export type FilesArea = 'admin' | 'member'

const FILES_ROOT: Record<FilesArea, string> = {
  admin: '/admin/files',
  member: '/files',
}

export function filesHref(area: FilesArea, slugs: string[]): string {
  const root = FILES_ROOT[area]
  return slugs.length === 0 ? root : `${root}/${slugs.join('/')}`
}

export function adminFilesHref(slugs: string[]): string {
  return filesHref('admin', slugs)
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
