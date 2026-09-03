'use client'

import { cn } from '@/lib/utils'

type StorageUsageProps = {
  usedBytes: number
  totalBytes: number
  className?: string
}

const BYTES_PER_GB = 1024 * 1024 * 1024

export function StorageUsage({
  usedBytes,
  totalBytes,
  className,
}: StorageUsageProps) {
  const usedGB = usedBytes / BYTES_PER_GB
  const totalGB = totalBytes / BYTES_PER_GB
  const percentage = Math.min((usedBytes / totalBytes) * 100, 100)

  return (
    <div className={cn('flex w-full flex-col gap-1.5 sm:w-[200px]', className)}>
      <div className="flex items-baseline justify-between text-[12.5px] text-muted-foreground">
        <span>Storage</span>
        <span className="tabular-nums">
          {usedGB.toFixed(1)} of {totalGB.toFixed(0)} GB
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-divider">
        <div
          className={cn(
            'h-full rounded-full',
            percentage > 90 ? 'bg-error' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
