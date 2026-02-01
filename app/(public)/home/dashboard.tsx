import { Suspense } from 'react'
import { BookOpen, DollarSign, File, UserPlus, CheckCircle } from 'lucide-react'
import { User } from '@/lib/users/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { UpcomingEvents } from '@/components/events/UpcomingEvents'
import { isUserOnActiveTeam } from '@/lib/users'
import { TeamMemberTodo, TeamMemberTodoLoading } from '@/components/team-todos'
import { CommunityEncouragement } from '@/components/community-encouragement/CommunityEncouragement'

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
          {isUserOnActiveTeam(user) &&
            user.teamMemberInfo.status === 'paid' && (
              <div className="w-full h-full">
                <Button
                  variant="outline"
                  className="w-full h-52 flex flex-col items-center justify-center gap-2 bg-green-50 border-green-200 cursor-default"
                  disabled
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  <span className="text-lg font-semibold text-green-700">
                    Team Fees Paid
                  </span>
                  <span className="text-sm text-green-600">Thank you!</span>
                </Button>
              </div>
            )}

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
          {prayerWheelUrl && (
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
