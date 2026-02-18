'use server'

import { Result } from '@/lib/results'
import { getMeetingMinutesPage } from '@/lib/files'
import {
  PagedMeetingMinuteFiles,
  StorageSortDirection,
  StorageSortField,
} from '@/lib/files/types'

export type MeetingMinutesPageParams = {
  page: number
  pageSize?: number
  sortField?: StorageSortField
  sortDirection?: StorageSortDirection
}

export async function getMeetingMinutesPageAction({
  page,
  pageSize = 10,
  sortField = 'created_at',
  sortDirection = 'desc',
}: MeetingMinutesPageParams): Promise<Result<string, PagedMeetingMinuteFiles>> {
  return getMeetingMinutesPage(page, pageSize, sortField, sortDirection)
}
