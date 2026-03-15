'use client'

/**
 * Test Page 2: "Card Dashboard"
 *
 * Vibe: Structured, informative, professional.
 * Purpose: Give an at-a-glance overview of everything relevant.
 * Layout: Multi-card grid with status indicators and rich info.
 *
 * Design philosophy: Some users want to see the big picture —
 * weekend status, their todos, upcoming events, and quick actions
 * all visible at once without scrolling. Information density is a feature.
 */

import {
  Calendar,
  CheckCircle2,
  Circle,
  UserPlus,
  FileText,
  Clock,
  Users,
  ArrowRight,
  MapPin,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Mock data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  isTeamMember: true,
  role: 'Table Leader',
  weekendNumber: 11,
}

const mockWeekend = {
  number: 11,
  mensStart: 'Sep 4, 2025',
  mensEnd: 'Sep 7, 2025',
  womensStart: 'Sep 11, 2025',
  womensEnd: 'Sep 14, 2025',
  daysAway: 23,
  teamCount: 68,
  candidateCount: 34,
}

const mockTodos = [
  { id: 1, label: 'Complete team application', done: true },
  { id: 2, label: 'Submit medical info', done: true },
  { id: 3, label: 'Pay team fee ($45)', done: false },
  { id: 4, label: 'Review weekend schedule', done: false },
]

const mockEvents = [
  {
    id: 1,
    title: 'Team Meeting',
    date: 'Aug 23, 2025',
    time: '6:00 PM',
    location: 'Fellowship Hall',
  },
  {
    id: 2,
    title: 'Send-Off Dinner',
    date: 'Sep 3, 2025',
    time: '5:30 PM',
    location: 'Tanglewood',
  },
  {
    id: 3,
    title: 'Closing Ceremony',
    date: 'Sep 7, 2025',
    time: '4:00 PM',
    location: 'Tanglewood',
  },
]

const mockEncouragement =
  'Therefore encourage one another and build each other up, just as in fact you are doing. — 1 Thessalonians 5:11'

export default function TestPage2() {
  const completedCount = mockTodos.filter((t) => t.done).length
  const progressPercent = (completedCount / mockTodos.length) * 100

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
      {/* Page label */}
      <Badge variant="outline" className="mb-4">
        Test Layout 2 — Card Dashboard
      </Badge>

      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
        <div>
          <Typography variant="h1" className="text-2xl md:text-3xl font-bold">
            Welcome back, {mockUser.firstName}
          </Typography>
          <Typography variant="muted">
            {mockUser.role} · DTTD #{mockUser.weekendNumber} ·{' '}
            {mockWeekend.daysAway} days away
          </Typography>
        </div>
        <Button href="#" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          View Weekend
        </Button>
      </div>

      {/* Encouragement Banner */}
      <Card className="mb-6 bg-primary/5 border-primary/10">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <Typography variant="small" className="italic text-foreground/80">
              {mockEncouragement}
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Weekend Status Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              Weekend Status
            </CardDescription>
            <CardTitle className="text-xl">
              DTTD #{mockWeekend.number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Men&apos;s</span>
                <span className="font-medium">
                  {mockWeekend.mensStart} – {mockWeekend.mensEnd}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Women&apos;s</span>
                <span className="font-medium">
                  {mockWeekend.womensStart} – {mockWeekend.womensEnd}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{mockWeekend.teamCount} team</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{mockWeekend.candidateCount} candidates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Todo Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wide">
                Your Tasks
              </CardDescription>
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{mockTodos.length}
              </Badge>
            </div>
            <Progress value={progressPercent} max={100} className="h-1.5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {mockTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2.5">
                  {todo.done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${todo.done ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {todo.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              Quick Actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              href="#"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Current Weekend
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              href="#"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sponsor a Candidate
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              href="#"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Prayer Wheel
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              href="#"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Files & Documents
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div>
        <Typography variant="h2" className="text-lg font-semibold mb-3">
          Upcoming Events
        </Typography>
        <div className="grid md:grid-cols-3 gap-3">
          {mockEvents.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date} · {event.time}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
