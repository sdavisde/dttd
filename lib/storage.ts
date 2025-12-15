import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@/lib/supabase/types'

async function getFolderSize(
  supabase: SupabaseClient,
  bucketName: string,
  folderPath: string = ''
): Promise<number> {
  const { data: items, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath)

  if (error) {
    throw new Error(
      `Failed to list items in ${bucketName}/${folderPath}: ${error.message}`
    )
  }

  let size = 0
  for (const item of items) {
    if (item.metadata?.size) {
      size += item.metadata.size
    } else {
      const childPath = folderPath ? `${folderPath}/${item.name}` : item.name
      const folderSize = await getFolderSize(supabase, bucketName, childPath)
      size += folderSize
    }
  }

  return size
}

export async function getStorageUsage() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    throw new Error(`Failed to list buckets: ${bucketsError.message}`)
  }

  let totalSize = 0
  for (const bucket of buckets) {
    const folderSize = await getFolderSize(supabase, bucket.name)
    totalSize += folderSize
  }

  return totalSize
}
