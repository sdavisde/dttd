'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StorageUsageProps = {
  usedBytes: number
  totalBytes: number
}

export function StorageUsage({ usedBytes, totalBytes }: StorageUsageProps) {
  const usedGB = usedBytes / (1024 * 1024 * 1024)
  const totalGB = totalBytes / (1024 * 1024 * 1024)
  const percentage = (usedBytes / totalBytes) * 100

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Storage Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                percentage > 90
                  ? 'bg-red-500'
                  : percentage > 75
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-[50px]">
            {percentage.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {usedGB.toFixed(2)} GB used of {totalGB.toFixed(2)} GB
        </p>
      </CardContent>
    </Card>
  )
}
