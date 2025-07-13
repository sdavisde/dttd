'use client'

import { useSession } from '@/components/auth/session-provider'
import { BookOpen, Calendar, Clock, DollarSign, File, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { TeamMember } from '@/lib/weekend/types'
import { AssignmentAdd } from '@mui/icons-material'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface DashboardProps {
  /** Information about the current user's place on the weekend roster */
  rosterInfo: TeamMember | null
}

export function Dashboard({ rosterInfo }: DashboardProps) {
  const { user, loading: sessionLoading } = useSession()

  if (sessionLoading) {
    return (
      <div className='flex justify-center items-center h-[80vh]'>
        <Loader2 className='w-10 h-10 animate-spin' />
      </div>
    )
  }

  return (
    <div className='my-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <Typography variant='h1'>
            Hi {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </Typography>
          <Typography>This is your personal space in the Dusty Trails Tres Dias community.</Typography>
          <Typography variant='muted'>Here you'll find important information, updates, and resources.</Typography>
        </div>

        {/* Information for the upcoming events (Meetings / Weekend) */}
        <div className='w-full mt-4'>
          <Typography variant='h2'>Upcoming Events</Typography>
        </div>
        {/* // todo: this should be coming from the database */}
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Alert>
            <Calendar className='w-6 h-6' />
            <AlertTitle className='text-lg font-semibold'>Team Meeting #1</AlertTitle>
            <AlertDescription>
              <span>Saturday, July 12, 2025</span>
              <span>9:15 AM - Grace Church in Cameron</span>
            </AlertDescription>
          </Alert>
        </div>

        {/* Dynamic Action Section */}

        <div className='w-full mt-4'>
          <Typography variant='h2'>Dashboard</Typography>
        </div>

        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          {rosterInfo && rosterInfo.status !== 'paid' && (
            <Link
              href={`/payment/team-fee?weekend_id=${rosterInfo.weekend_id}`}
              className='w-full h-full'
            >
              <Button
                variant='outline'
                className='w-full h-52 flex flex-col items-center justify-center gap-2'
              >
                <DollarSign className='w-10 h-10' />
                <span className='text-lg font-semibold'>Pay Team Fees</span>
              </Button>
            </Link>
          )}
          <Link
            href='/sponsor'
            className='w-full h-full'
          >
            <Button
              variant='outline'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
            >
              <AssignmentAdd className='w-10 h-10' />
              <span className='text-lg font-semibold'>Sponsor a Candidate</span>
            </Button>
          </Link>
          <Link
            href='/job-description'
            className='w-full h-full pointer-events-none'
          >
            <Button
              variant='outline'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
              disabled
            >
              <BookOpen className='w-10 h-10' />
              <span className='text-lg font-semibold'>Job Description</span>
              <span className='text-sm text-gray-500'>Coming Soon</span>
            </Button>
          </Link>
          <Link
            href='/prayer-wheel-signup'
            className='w-full h-full pointer-events-none'
          >
            <Button
              variant='secondary'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
              disabled
            >
              <File className='w-10 h-10' />
              <span className='text-lg font-semibold'>Prayer Wheel Signup</span>
              <span className='text-sm text-gray-500'>Coming Soon</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
