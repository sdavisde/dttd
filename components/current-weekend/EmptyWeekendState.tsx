import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { CalendarX } from 'lucide-react'

export function EmptyWeekendState() {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <CalendarX className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <Typography variant="h3" className="text-lg font-medium">
              No Upcoming Weekends
            </Typography>
            <Typography variant="muted">
              No upcoming weekends at this time. Check back soon!
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
