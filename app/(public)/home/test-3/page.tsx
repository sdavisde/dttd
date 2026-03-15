'use client'

/**
 * Test Page 3: "Timeline Journey"
 *
 * Vibe: Story-driven, warm, anticipation-building.
 * Purpose: Orient users in time relative to the weekend, showing
 *          where they are in the journey from preparation to the big day.
 * Layout: Vertical timeline with the weekend as the anchor point.
 *
 * Design philosophy: The weekend is the main event that everything
 * revolves around. Show users where they are in the timeline —
 * what's been done, what's coming up, and what they need to do NOW.
 */

import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  ArrowRight,
  UserPlus,
  FileText,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'

// Mock data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'Table Leader',
  weekendType: "Women's",
}

const mockWeekend = {
  number: 11,
  daysAway: 23,
  startDate: 'September 11, 2025',
  endDate: 'September 14, 2025',
}

type TimelineItem = {
  id: number
  title: string
  description: string
  date: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'task' | 'event' | 'milestone'
}

const timelineItems: TimelineItem[] = [
  {
    id: 1,
    title: 'Team application submitted',
    description: 'You accepted your role as Table Leader',
    date: 'Jul 15',
    status: 'completed',
    type: 'task',
  },
  {
    id: 2,
    title: 'Medical information submitted',
    description: 'Health and emergency contact info on file',
    date: 'Jul 22',
    status: 'completed',
    type: 'task',
  },
  {
    id: 3,
    title: 'Team Meeting',
    description: 'Fellowship Hall · 6:00 PM',
    date: 'Aug 23',
    status: 'current',
    type: 'event',
  },
  {
    id: 4,
    title: 'Pay team member fee',
    description: '$45 — complete before the weekend',
    date: 'Due by Sep 1',
    status: 'upcoming',
    type: 'task',
  },
  {
    id: 5,
    title: 'Send-Off Dinner',
    description: 'Tanglewood · 5:30 PM',
    date: 'Sep 10',
    status: 'upcoming',
    type: 'event',
  },
  {
    id: 6,
    title: "Women's Weekend Begins",
    description: 'DTTD #11 · Tanglewood Conference Center',
    date: 'Sep 11',
    status: 'upcoming',
    type: 'milestone',
  },
]

function TimelineIcon({ item }: { item: TimelineItem }) {
  if (item.status === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-primary" />
  }
  if (item.type === 'milestone') {
    return <Star className="h-5 w-5 text-amber-500" />
  }
  if (item.status === 'current') {
    return (
      <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20" />
    )
  }
  return <Circle className="h-5 w-5 text-muted-foreground/30" />
}

export default function TestPage3() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Page label */}
      <Badge variant="outline" className="mb-6">
        Test Layout 3 — Timeline Journey
      </Badge>

      {/* Hero countdown */}
      <div className="text-center mb-10">
        <Typography variant="muted" className="text-sm uppercase tracking-wide">
          {mockUser.weekendType} Weekend · DTTD #{mockWeekend.number}
        </Typography>
        <div className="my-4">
          <span className="text-6xl md:text-7xl font-bold tracking-tight text-primary">
            {mockWeekend.daysAway}
          </span>
        </div>
        <Typography className="text-lg text-muted-foreground">
          days until your weekend begins
        </Typography>
        <Typography variant="muted" className="text-sm mt-1">
          {mockWeekend.startDate} – {mockWeekend.endDate}
        </Typography>
      </div>

      {/* Role badge */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {mockUser.role}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Hey {mockUser.firstName}, here&apos;s your journey so far
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border" />

        <div className="space-y-6">
          {timelineItems.map((item) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 shrink-0 bg-background">
                <TimelineIcon item={item} />
              </div>

              {/* Content */}
              <div
                className={`flex-1 pb-2 ${item.status === 'completed' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : item.type === 'milestone'
                            ? 'text-amber-600 font-semibold'
                            : ''
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.date}
                  </span>
                </div>

                {/* Action button for current/actionable items */}
                {item.status === 'current' && item.type === 'task' && (
                  <Button size="sm" className="mt-2 h-8" href="#">
                    Complete
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
                {item.status === 'upcoming' && item.type === 'task' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-8"
                    href="#"
                  >
                    {item.title.startsWith('Pay') ? 'Pay Now' : 'View'}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <Card className="mt-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">More things you can do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            href="#"
          >
            <UserPlus className="h-4 w-4" />
            Sponsor a Candidate
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            href="#"
          >
            <FileText className="h-4 w-4" />
            Prayer Wheel Signup
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            href="#"
          >
            <Calendar className="h-4 w-4" />
            View Full Weekend Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
