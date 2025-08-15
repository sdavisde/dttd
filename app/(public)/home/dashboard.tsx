import {
  BookOpen,
  Calendar,
  DollarSign,
  File,
  UserPlus,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { User } from '@/lib/users/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { UpcomingEvents } from '@/components/events/UpcomingEvents'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  return (
    <div className="my-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography variant="h1">
            Hi {user.first_name} {user.last_name}
          </Typography>
          <Typography>
            This is your personal space in the Dusty Trails Tres Dias community.
          </Typography>
          <Typography variant="muted">
            Here you'll find important information, updates, and resources.
          </Typography>
        </div>

        <UpcomingEvents />

        {/* Dynamic Action Section */}

        <div className="w-full mt-4">
          <Typography variant="h2">Dashboard</Typography>
        </div>

        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.team_member_info && user.team_member_info.status === 'paid' && (
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
          {user.team_member_info && user.team_member_info.status !== 'paid' && (
            <Link
              href={`/payment/team-fee?weekend_id=${user.team_member_info.weekend_id}`}
              className="w-full h-full"
            >
              <Button
                variant="outline"
                className="w-full h-52 flex flex-col items-center justify-center gap-2"
              >
                <DollarSign className="w-10 h-10" />
                <span className="text-lg font-semibold">Pay Team Fees</span>
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2"
            // todo: eventually this should link back to the /sponsor page. We put this here because the sponsorship flow is not ready yet.
            // more info in the README.
            href="https://docs.google.com/forms/d/e/1FAIpQLSeQVh9Ml-kbv7NTM20icotI9RQDn2gL9YUSP53nO2GGK5v1Lg/viewform"
            linkProps={{ target: '_blank', rel: 'noopener noreferrer' }}
          >
            <UserPlus className="w-10 h-10" />
            <span className="text-lg font-semibold">Sponsor a Candidate</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2"
            href={
              user.gender === 'male'
                ? 'https://www.signupgenius.com/go/10C0E4FACAF22A5FDC34-57382252-womens#/'
                : 'https://www.signupgenius.com/go/10C084FA4AC2CA2FEC43-57390609-mens'
            }
          >
            <File className="w-10 h-10" />
            <span className="text-lg font-semibold">Prayer Wheel Signup</span>
          </Button>
          <Button
            href="/job-description"
            variant="outline"
            className="w-full h-52 flex flex-col items-center justify-center gap-2 pointer-events-none"
            disabled
          >
            <BookOpen className="w-10 h-10" />
            <span className="text-lg font-semibold">Job Description</span>
            <span className="text-sm text-gray-500">Coming Soon</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
