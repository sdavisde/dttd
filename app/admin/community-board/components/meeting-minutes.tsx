'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import type { MeetingMinuteFile } from '@/lib/files/types'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MeetingMinutesUpload } from './meeting-minutes-upload'
import { MeetingMinutesList } from './meeting-minutes-list'
import { MEETING_MINUTES_FILES_HREF } from './minutes-summary'

type MeetingMinutesProps = {
  /** The most recent minutes, newest first. */
  files: MeetingMinuteFile[]
  loadError?: string | null
}

export function MeetingMinutes({ files, loadError }: MeetingMinutesProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between pb-2">
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

        <MeetingMinutesList files={files} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-3 pb-1">
          <p className="text-[13px] text-muted-foreground">
            Minutes live in Files under {MEETING_MINUTES_FOLDER}.
          </p>
          <Link
            href={MEETING_MINUTES_FILES_HREF}
            className="flex min-h-11 items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-hover md:min-h-0"
          >
            View all in Files
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
