'use client'

import { useSession } from '@/components/auth/session-provider'
import { Money } from '@mui/icons-material'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import { BookOpen, Calendar, Clock, DollarSign, File } from 'lucide-react'

import Link from 'next/link'

export function Dashboard() {
  const { user } = useSession()

  return (
    <Box sx={{ my: 4 }}>
      <Stack gap={2}>
        <Stack>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
          >
            Hi {user?.email}
          </Typography>
          <Typography variant='body1'>This is your personal space in the Dusty Trails Tres Dias community.</Typography>
          <Typography variant='body1'>Here you'll find important information, updates, and resources.</Typography>
        </Stack>

        {/* Information for the upcoming events (Meetings / Weekend) */}
        <div className='w-full p-4'>
          <Typography variant='h6'>Upcoming Events</Typography>
        </div>
        <div className='w-full h-full grid grid-cols-3 gap-4'>
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

        <div className='w-full h-full grid grid-cols-3 gap-4'>
          <Link
            href='/payment/team-fee'
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
          <Link
            href='/payment/team-fee'
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
            href='/payment/team-fee'
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
