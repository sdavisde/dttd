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

export type MeetingMinuteFile = FileObject & {
  location?: string
}

export type PagedMeetingMinuteFiles = Omit<
  PagedFileItems,
  'currentPageItems' | 'nextPageItems'
> & {
  currentPageItems: MeetingMinuteFile[]
  nextPageItems: MeetingMinuteFile[]
}
