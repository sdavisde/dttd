'use client'

import { AlertTriangle } from 'lucide-react'
import type { PagedMeetingMinuteFiles } from '@/lib/files/types'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MeetingMinutesUpload } from './meeting-minutes-upload'
import { MeetingMinutesTable } from './meeting-minutes-table'

type MeetingMinutesProps = {
  initialPageData: PagedMeetingMinuteFiles
  loadError?: string | null
}

export function MeetingMinutes({
  initialPageData,
  loadError,
}: MeetingMinutesProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-serif text-lg font-semibold tracking-tight">
            Meeting minutes
          </h2>
          <MeetingMinutesUpload />
        </div>
        {loadError !== null && loadError !== undefined && loadError !== '' && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to load meeting minutes</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}
        <MeetingMinutesTable initialPageData={initialPageData} />
        <p className="border-t border-divider pt-3 pb-1 text-[13px] text-muted-foreground">
          Meeting minutes are visible to everyone.
        </p>
      </CardContent>
    </Card>
  )
}
