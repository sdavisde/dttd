import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { Typography } from '@/components/ui/typography'

interface PrayerWheelButtonsProps {
  mensUrl: string
  womensUrl: string
}

export function PrayerWheelButtons({
  mensUrl,
  womensUrl,
}: PrayerWheelButtonsProps) {
  const hasMensUrl = Boolean(mensUrl)
  const hasWomensUrl = Boolean(womensUrl)

  if (!hasMensUrl && !hasWomensUrl) {
    return null
  }

  return (
    <div>
      <Typography>Prayer Wheel Signup</Typography>
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        {hasMensUrl && (
          <Button asChild variant="outline" className="flex-1">
            <a
              href={mensUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Men&apos;s Prayer Wheel
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        {hasWomensUrl && (
          <Button asChild variant="outline" className="flex-1">
            <a
              href={womensUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Women&apos;s Prayer Wheel
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
