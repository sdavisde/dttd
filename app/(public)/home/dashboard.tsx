import { Suspense } from 'react'
import {
  BookOpen,
  DollarSign,
  File,
  HandHeart,
  UserPlus,
  CheckCircle,
  CalendarDays,
  Shield,
} from 'lucide-react'
import type { User } from '@/lib/users/types'
import { isNil } from 'lodash'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { UpcomingEvents } from '@/components/events/UpcomingEvents'
import { isUserOnActiveTeam, isUserRector } from '@/lib/users'
import { TeamMemberTodo, TeamMemberTodoLoading } from '@/components/team-todos'
import { CommunityEncouragement } from '@/components/community-encouragement/CommunityEncouragement'
import { CHARole, WeekendType } from '@/lib/weekend/types'

interface DashboardProps {
  user: User
  prayerWheelUrl: string | null
}

export function Dashboard({ user, prayerWheelUrl }: DashboardProps) {
  return (
    <div className="my-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography variant="h1">
            Hi {user.firstName} {user.lastName}
          </Typography>
          <Typography>
            This is your personal space in the Dusty Trails Tres Dias community.
          </Typography>
          <Typography variant="muted">
            Here you&apos;ll find important information, updates, and resources.
          </Typography>
        </div>

        <CommunityEncouragement user={user} />

        <RectorBanner user={user} />

        <UpcomingEvents />

        {isUserOnActiveTeam(user) && (
          <Suspense fallback={<TeamMemberTodoLoading />}>
            <TeamMemberTodo user={user} />
          </Suspense>
        )}

        {/* Dynamic Action Section */}

        <div className="w-full mt-4">
          <Typography variant="h2">Dashboard</Typography>
        </div>

        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2"
            href="/current-weekend"
          >
            <CalendarDays className="w-10 h-10" />
            <span className="text-lg font-semibold">Current Weekend</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2"
            // todo: eventually this should link back to the /sponsor page. We put this here because the sponsorship flow is not ready yet.
            // more info in the README.
            href="/sponsor"
          >
            <UserPlus className="w-10 h-10" />
            <span className="text-lg font-semibold">Sponsor a Candidate</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2"
            href="/secuela-signin"
          >
            <HandHeart className="w-10 h-10" />
            <span className="text-lg font-semibold">Sign Up to Serve</span>
          </Button>
          {!isNil(prayerWheelUrl) && (
            <Button
              variant="outline"
              className="w-full h-52 flex flex-col items-center justify-center gap-2"
              href={prayerWheelUrl}
            >
              <File className="w-10 h-10" />
              <span className="text-lg font-semibold">Prayer Wheel Signup</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function RectorBanner({ user }: { user: User }) {
  const isRector = isUserRector(user)

  if (!isRector) return null

  const rectorAssignment = user.teamMemberInfo?.weekendAssignments.find(
    (a) => a.chaRole === CHARole.RECTOR
  )

  const groupNumber = user.teamMemberInfo?.groupNumber
  const weekendLabel =
    rectorAssignment?.weekendType === WeekendType.MENS ? "Men's" : "Women's"

  return (
    <div className="mt-2">
      <Button
        href="/roster-builder"
        variant="outline"
        className="w-full flex items-center gap-4 p-6 h-auto border-primary/30 bg-primary/5 hover:bg-primary/10"
      >
        <Shield className="w-8 h-8 text-primary shrink-0" />
        <div className="flex flex-col items-start gap-1 text-left">
          <span className="text-lg font-semibold">
            You&apos;re the Rector for DTTD #{groupNumber} {weekendLabel}{' '}
            Weekend
          </span>
          <span className="text-sm text-muted-foreground">
            Build Your Roster &rarr;
          </span>
        </div>
      </Button>
    </div>
  )
}
