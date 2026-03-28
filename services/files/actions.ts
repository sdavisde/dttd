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

export const uploadFileAction = authorizedAction<
  FormData,
  { fileName: string }
>(Permission.FILES_UPLOAD, async (formData) => {
  const folder = formData.get('folder')
  const file = formData.get('file')
  const metadataValue = formData.get('metadata')

  if (typeof folder !== 'string' || folder.trim() === '') {
    return err('Folder is required')
  }

  if (!(file instanceof File) || file.size === 0) {
    return err('A file is required')
  }

  let metadata: Record<string, string> | undefined

  if (typeof metadataValue === 'string' && metadataValue.trim() !== '') {
    try {
      metadata = JSON.parse(metadataValue) as Record<string, string>
    } catch {
      return err('Invalid file metadata')
    }
  }

  return FileService.uploadFile({
    folder: folder.trim(),
    file,
    metadata,
  })
})
