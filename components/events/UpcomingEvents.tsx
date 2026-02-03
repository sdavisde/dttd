import { Calendar } from 'lucide-react'
import { getUpcomingEvents } from '@/services/events'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { EventCard } from './EventCard'
import { isErr } from '@/lib/results'
import { logger } from '@/lib/logger'

export async function UpcomingEvents() {
  const eventResult = await getUpcomingEvents()

  if (isErr(eventResult)) {
    logger.error(eventResult.error)
  }

  const topThree = eventResult.data?.slice(0, 3) ?? []

  return (
    <div className="w-full">
      <div className="w-full mt-4 mb-2">
        <Typography variant="h2">Upcoming Events</Typography>
      </div>

      {topThree.length === 0 ? (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Alert>
            <Calendar className="w-6 h-6" />
            <AlertTitle>No Upcoming Events</AlertTitle>
            <AlertDescription>
              There are currently no upcoming events scheduled.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((event) => (
            <EventCard key={event.id} event={event} canEdit={false} />
          ))}
        </div>
      )}
    </div>
  )
}
