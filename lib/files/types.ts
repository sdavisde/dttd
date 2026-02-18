import { FileObject } from '@supabase/storage-js'

export type StorageSortField = 'name' | 'created_at'
export type StorageSortDirection = 'asc' | 'desc'

export type PagedFileItems = {
  page: number
  pageSize: number
  sortField: StorageSortField
  sortDirection: StorageSortDirection
  currentPageItems: FileObject[]
  nextPageItems: FileObject[]
}
