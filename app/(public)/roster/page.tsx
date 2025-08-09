import { createClient } from '@/lib/supabase/server'
import { getActiveWeekends, getWeekendRoster } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { WeekendRosterTable } from '@/app/admin/weekends/[weekend_id]/weekend-roster-table'
import { Typography } from '@/components/ui/typography'
import { notFound, redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'

export default async function RosterPage() {
  const supabase = await createClient()

  // Get current user
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  // Get active weekends
  const activeWeekendsResult = await getActiveWeekends()
  if (isErr(activeWeekendsResult)) {
    throw new Error(
      `Failed to fetch active weekends: ${activeWeekendsResult.error.message}`
    )
  }

  // Get the upcoming weekend that matches user's gender
  const upcomingWeekend =
    activeWeekendsResult.data[
      userResult.data.gender === 'male' ? 'MENS' : 'WOMENS'
    ]

  if (!upcomingWeekend) {
    return (
      <div className="container mx-auto px-8 py-8">
        <Typography variant="h1" className="text-2xl mb-4">
          Weekend Roster
        </Typography>
        <Typography variant="muted">
          No upcoming weekend found for your gender group.
        </Typography>
      </div>
    )
  }

  // Get weekend roster
  const rosterResult = await getWeekendRoster(upcomingWeekend.id)
  if (isErr(rosterResult)) {
    throw new Error(`Failed to fetch roster: ${rosterResult.error.message}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8">
        <Typography variant="h1" className="text-2xl mb-2">
          Weekend Roster
        </Typography>
        <Typography variant="h2" className="text-lg mb-2">
          {upcomingWeekend.title ||
            `${upcomingWeekend.type} Weekend #${upcomingWeekend.number}`}
        </Typography>
        <Typography variant="muted" className="text-base">
          {formatDate(upcomingWeekend.start_date)} -{' '}
          {formatDate(upcomingWeekend.end_date)}
        </Typography>
      </div>

      <div>
        <Typography variant="h2" className="text-xl mb-4 flex items-center">
          Team Members
          <span className="text-black/30 font-light text-base ms-2">
            ({rosterResult.data.length} members)
          </span>
        </Typography>

        <WeekendRosterTable roster={rosterResult.data} isEditable={false} />
      </div>
    </div>
  )
}
