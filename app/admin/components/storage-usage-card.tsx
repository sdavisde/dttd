import Link from 'next/link'
import { logger } from '@/lib/logger'
import { getStorageUsage, STORAGE_QUOTA_BYTES } from '@/lib/storage'
import { Skeleton } from '@/components/ui/skeleton'

const BYTES_PER_GB = 1024 * 1024 * 1024

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          File storage used
        </h2>
        <Link
          href="/admin/files"
          className="text-[13px] font-semibold text-primary hover:text-primary-hover"
        >
          Open Files →
        </Link>
      </div>
      {children}
    </section>
  )
}

/**
 * Live storage usage for the whole community, against the shared quota.
 *
 * `getStorageUsage()` walks every bucket one folder at a time, so this is the
 * slowest thing on the dashboard — it is its own async component so the page
 * can stream it behind a Suspense boundary instead of waiting on it.
 */
export async function StorageUsageCard() {
  let usedBytes: number
  try {
    usedBytes = await getStorageUsage()
  } catch (error) {
    logger.error({ error, msg: 'Failed to read storage usage for /admin' })
    return (
      <CardShell>
        <p className="mt-4 text-sm text-muted-foreground">
          Unavailable right now
        </p>
      </CardShell>
    )
  }

  const usedGb = usedBytes / BYTES_PER_GB
  const totalGb = STORAGE_QUOTA_BYTES / BYTES_PER_GB
  const percentage = Math.min((usedBytes / STORAGE_QUOTA_BYTES) * 100, 100)

  return (
    <CardShell>
      <p className="mt-3 font-serif text-xl font-semibold tabular-nums">
        {usedGb.toFixed(1)}{' '}
        <span className="text-sm font-normal">of {totalGb.toFixed(0)} GB</span>
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-1.5 rounded-full ${percentage > 90 ? 'bg-error' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
          aria-hidden
        />
      </div>
    </CardShell>
  )
}

/** Same shape as the loaded card, so nothing shifts when the number lands. */
export function StorageUsageCardSkeleton() {
  return (
    <CardShell>
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
    </CardShell>
  )
}
