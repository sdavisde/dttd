'use client'

import { useSession } from '@/components/auth/session-provider'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { BookOpen, Calendar, Clock, DollarSign, File } from 'lucide-react'
import Link from 'next/link'
import { TeamMember } from '@/lib/weekend/types'
import { AssignmentAdd } from '@mui/icons-material'

interface DashboardProps {
  /** Information about the current user's place on the weekend roster */
  rosterInfo: TeamMember | null
}

export function Dashboard({ rosterInfo }: DashboardProps) {
  const { user, loading: sessionLoading } = useSession()

  if (sessionLoading) {
    return (
      <div className='flex justify-center items-center h-[80vh]'>
        <CircularProgress size={75} />
      </div>
    )
  }

  return (
    <Box sx={{ my: 4 }}>
      <Stack gap={2}>
        <Stack>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
          >
            Hi {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </Typography>
          <Typography variant='body1'>This is your personal space in the Dusty Trails Tres Dias community.</Typography>
          <Typography variant='body1'>Here you'll find important information, updates, and resources.</Typography>
        </Stack>

        {/* Information for the upcoming events (Meetings / Weekend) */}
        <div className='w-full p-4'>
          <Typography variant='h6'>Upcoming Events</Typography>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='w-full h-full bg-gray-100 rounded-lg p-4 flex flex-col gap-2'>
            <Typography variant='h6'>Team Meeting #1</Typography>
            <Typography
              variant='body1'
              className='flex items-center gap-2'
            >
              <Calendar />
              <span>Saturday, July 12, 2025</span>
            </Typography>
            <Typography
              variant='caption'
              className='flex items-center gap-2'
            >
              <Clock />
              <span>9:15 AM - Grace Church in Cameron</span>
            </Typography>
          </div>
        </div>

        {/* Dynamic Action Section */}

        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          {rosterInfo && rosterInfo.status !== 'paid' && (
            <Link
              href={`/payment/team-fee?weekend_id=${rosterInfo.weekend_id}`}
              className='w-full h-full'
            >
              <Button
                variant='outlined'
                className='w-full h-52 flex flex-col items-center justify-center gap-2'
              >
                <DollarSign className='w-10 h-10' />
                <Typography variant='h6'>Pay Team Fees</Typography>
              </Button>
            </Link>
          )}
          <Link
            href='/sponsor'
            className='w-full h-full'
          >
            <Button
              variant='outlined'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
            >
              <AssignmentAdd className='w-10 h-10' />
              <Typography variant='h6'>Sponsor a Candidate</Typography>
            </Button>
          </Link>
          <Link
            href='/job-description'
            className='w-full h-full pointer-events-none'
          >
            <Button
              variant='outlined'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
              disabled
            >
              <BookOpen className='w-10 h-10' />
              <Typography variant='h6'>Job Description</Typography>
              <p className='text-sm text-gray-500'>Coming Soon</p>
            </Button>
          </Link>
          <Link
            href='/prayer-wheel-signup'
            className='w-full h-full pointer-events-none'
          >
            <Button
              variant='outlined'
              className='w-full h-52 flex flex-col items-center justify-center gap-2'
              disabled
            >
              <File className='w-10 h-10' />
              <Typography variant='h6'>Prayer Wheel Signup</Typography>
              <p className='text-sm text-gray-500'>Coming Soon</p>
            </Button>
          </Link>
        </div>
      </Stack>
    </Box>
  )
}
