import { Typography } from './typography'
import { type FormattedDateTime } from '@/lib/utils'
import { isNil } from 'lodash'

type DatetimeOptions = {
  showTime?: boolean
}

export function Datetime({
  dateTime,
  location,
  options,
}: {
  dateTime: FormattedDateTime
  location?: string | null
  options?: DatetimeOptions
}) {
  return typeof dateTime === 'object' ? (
    <>
      <Typography variant="small" className="block">
        {dateTime.dateStr}
      </Typography>
      {options?.showTime === true && (
        <Typography variant="small" className="block text-muted-foreground">
          {dateTime.timeStr}
          {!isNil(location) && location !== '' && ` - ${location}`}
        </Typography>
      )}
    </>
  ) : (
    <Typography variant="small" className="block text-muted-foreground">
      {dateTime}
    </Typography>
  )
}
