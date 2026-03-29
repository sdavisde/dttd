import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type {
  SearchOptions,
  FileOptions,
  FileObject,
} from '@supabase/storage-js'

type SortOptions = NonNullable<SearchOptions['sortBy']>

export async function listBuckets() {
  const supabase = await createClient()
  return supabase.storage.listBuckets()
}

export async function listFiles(
  bucket: string,
  path: string,
  options?: SearchOptions
) {
  const supabase = await createClient()
  return supabase.storage.from(bucket).list(path, options)
}

export async function listFilesPage(
  bucket: string,
  path: string,
  limit: number,
  offset: number,
  sortBy: SortOptions
) {
  const supabase = await createClient()
  return supabase.storage.from(bucket).list(path, {
    limit,
    offset,
    sortBy,
  })
}

export async function getFileInfo(bucket: string, path: string) {
  const supabase = await createClient()
  return supabase.storage.from(bucket).info(path)
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: FileOptions
) {
  const supabase = await createClient()
  return supabase.storage.from(bucket).upload(path, file, options)
}

export function filterPlaceholderFiles(files: FileObject[] | null | undefined) {
  return (files ?? []).filter((file) => file.name !== '.placeholder')
}
