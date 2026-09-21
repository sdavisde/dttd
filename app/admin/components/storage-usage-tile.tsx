import Link from 'next/link'
import { logger } from '@/lib/logger'
import { getStorageUsage, STORAGE_QUOTA_BYTES } from '@/lib/storage'
import { Skeleton } from '@/components/ui/skeleton'

const BYTES_PER_GB = 1024 * 1024 * 1024

function TileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4.5 py-3.5">
      {children}
    </div>
  )
}

function Caption() {
  return (
    <p className="text-[13px] text-muted-foreground">
      File storage used ·{' '}
      <Link
        href="/admin/files"
        className="font-semibold text-primary hover:text-primary-hover"
      >
        Open Files →
      </Link>
    </p>
  )
}

/**
 * Live storage usage for the whole community, against the shared quota — the
 * fourth tile in the dashboard's metric row, with the fill shown inline.
 *
 * `getStorageUsage()` walks every bucket one folder at a time, so this is the
 * slowest thing on the dashboard — it is its own async component so the page
 * can stream it behind a Suspense boundary instead of waiting on it.
 */
export async function StorageUsageTile() {
  let usedBytes: number
  try {
    usedBytes = await getStorageUsage()
  } catch (error) {
    logger.error({ error, msg: 'Failed to read storage usage for /admin' })
    return (
      <TileShell>
        <p className="text-sm text-muted-foreground">Unavailable right now</p>
        <Caption />
      </TileShell>
    )
  }

  const usedGb = usedBytes / BYTES_PER_GB
  const totalGb = STORAGE_QUOTA_BYTES / BYTES_PER_GB
  const percentage = Math.min((usedBytes / STORAGE_QUOTA_BYTES) * 100, 100)

  return (
    <TileShell>
      <p className="font-serif text-2xl font-semibold tabular-nums">
        {usedGb.toFixed(1)}{' '}
        <span className="font-sans text-sm font-medium text-muted-foreground">
          of {totalGb.toFixed(0)} GB
        </span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-divider">
        <div
          className={`h-full rounded-full ${percentage > 90 ? 'bg-error' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
          aria-hidden
        />
      </div>
      <Caption />
    </TileShell>
  )
}

/** Same shape as the loaded tile, so nothing shifts when the number lands. */
export function StorageUsageTileSkeleton() {
  return (
    <TileShell>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Caption />
    </TileShell>
  )
}
