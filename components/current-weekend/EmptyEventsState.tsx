import { CalendarX } from 'lucide-react'

/**
 * Empty state component shown when no events exist for active weekends.
 */
export function EmptyEventsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        No Events Scheduled
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        There are no events scheduled for this weekend yet. Check back later for
        updates on meetings, serenades, sendoffs, and more.
      </p>
    </div>
  )
}
