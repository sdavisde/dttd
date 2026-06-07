'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { err, type Result } from '@/lib/results'
import { Permission } from '@/lib/security'
import type {
  PagedMeetingMinuteFiles,
  StorageSortDirection,
  StorageSortField,
} from '@/lib/files/types'
import * as FileService from './file-service'

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
  return FileService.getMeetingMinutesPage(
    page,
    pageSize,
    sortField,
    sortDirection
  )
}

export async function getFilePublicUrlAction(folder: string, fileName: string) {
  return FileService.getFilePublicUrl(folder, fileName)
}

export async function getFileDownloadUrlAction(
  folder: string,
  fileName: string
) {
  return FileService.getFileDownloadUrl(folder, fileName)
}

/**
 * Mints a one-time signed upload URL for a file. The bytes are uploaded directly
 * from the browser to Supabase Storage using the returned token (see
 * `uploadFileToStorage` in `lib/files/upload-client`), bypassing the Next.js
 * Server Action body-size limit. RBAC and extension validation happen here.
 */
export const createUploadUrlAction = authorizedAction<
  { folder: string; fileName: string },
  { bucket: string; path: string; token: string }
>(Permission.FILES_UPLOAD, async ({ folder, fileName }) => {
  if (typeof folder !== 'string' || folder.trim() === '') {
    return err('Folder is required')
  }

  if (typeof fileName !== 'string' || fileName.trim() === '') {
    return err('A file is required')
  }

  return FileService.createUploadUrl(folder.trim(), fileName.trim())
})
