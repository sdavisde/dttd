import { format } from 'date-fns'
import { Weekend } from '@/lib/weekend/types'
import { trimWeekendTypeFromTitle, formatWeekendTitle } from '@/lib/weekend'
import { Typography } from '@/components/ui/typography'

interface CurrentWeekendHeaderProps {
  mensWeekend: Weekend
  womensWeekend: Weekend
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}

function getWeekendGroupTitle(weekend: Weekend): string {
  const title = formatWeekendTitle(weekend)
  return trimWeekendTypeFromTitle(title).trim()
}

export function CurrentWeekendHeader({
  mensWeekend,
  womensWeekend,
}: CurrentWeekendHeaderProps) {
  // Use the weekend title from either weekend (they share the same group title like "DTTD #11")
  const groupTitle = getWeekendGroupTitle(mensWeekend)

  return (
    <div className="space-y-4">
      <Typography variant="h1" className="text-3xl md:text-4xl font-bold">
        {groupTitle}
      </Typography>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Typography className="font-medium w-40">
            Men&apos;s Weekend:
          </Typography>
          <Typography variant="muted">
            {formatDateRange(mensWeekend.start_date, mensWeekend.end_date)}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Typography className="font-medium w-40">
            Women&apos;s Weekend:
          </Typography>
          <Typography variant="muted">
            {formatDateRange(womensWeekend.start_date, womensWeekend.end_date)}
          </Typography>
        </div>
      </div>
    </div>
  )
}
