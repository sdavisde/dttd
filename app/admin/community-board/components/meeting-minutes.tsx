'use client'

import { AlertTriangle } from 'lucide-react'
import { PagedFileItems } from '@/lib/files/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { MeetingMinutesUpload } from './meeting-minutes-upload'
import { MeetingMinutesTable } from './meeting-minutes-table'

type MeetingMinutesProps = {
  initialPageData: PagedFileItems
  loadError?: string | null
}

export function MeetingMinutes({
  initialPageData,
  loadError,
}: MeetingMinutesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Board Meeting Minutes</CardTitle>
          <Typography variant="muted">
            Meeting minutes are visible to everyone.
          </Typography>
        </div>
        <MeetingMinutesUpload />
      </CardHeader>
      <CardContent>
        {loadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to load meeting minutes</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}
        <MeetingMinutesTable initialPageData={initialPageData} />
      </CardContent>
    </Card>
  )
}
