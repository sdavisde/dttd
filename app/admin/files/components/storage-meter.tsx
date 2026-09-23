import { isNil } from 'lodash'
import { StorageUsage } from '@/components/storage-usage'
import { getStorageUsage, STORAGE_QUOTA_BYTES } from '@/lib/storage'
import { logger } from '@/lib/logger'

async function readUsedBytes(): Promise<number | null> {
  try {
    return await getStorageUsage()
  } catch (error) {
    logger.error({ error }, 'Unable to compute storage usage')
    return null
  }
}

/**
 * Walks the whole bucket to total usage, so it streams in behind Suspense
 * instead of holding up the file listing.
 */
export async function StorageMeter() {
  const usedBytes = await readUsedBytes()
  if (isNil(usedBytes)) return null

  return <StorageUsage usedBytes={usedBytes} totalBytes={STORAGE_QUOTA_BYTES} />
}
