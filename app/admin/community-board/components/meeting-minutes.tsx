'use client'

import { FileObject } from '@supabase/storage-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { MeetingMinutesUpload } from './meeting-minutes-upload'
import { MeetingMinutesTable } from './meeting-minutes-table'

type MeetingMinutesProps = {
  initialFiles: FileObject[]
}

export function MeetingMinutes({ initialFiles }: MeetingMinutesProps) {
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
        <MeetingMinutesTable files={initialFiles} />
      </CardContent>
    </Card>
  )
}
