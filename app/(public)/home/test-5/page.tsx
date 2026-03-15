'use client'

/**
 * Test Page 5: "Command Center"
 *
 * Vibe: Efficient, dense, power-user. Everything at your fingertips.
 * Purpose: Pack maximum useful information into minimal space.
 *          No scrolling needed — everything visible on one screen.
 * Layout: Compact grid with small text, tight spacing, and
 *         information-dense sections. Sidebar + main content feel.
 *
 * Design philosophy: For community members who log in frequently
 * and just need to quickly check status, find a link, or see
 * what's next. Think: control panel, not magazine.
 */

import {
  Calendar,
  CheckCircle2,
  Circle,
  UserPlus,
  FileText,
  ArrowRight,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

// Mock data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'Table Leader',
  weekendNumber: 11,
  weekendType: "Women's",
}

const mockWeekend = {
  number: 11,
  daysAway: 23,
  mensStart: 'Sep 4',
  mensEnd: 'Sep 7',
  womensStart: 'Sep 11',
  womensEnd: 'Sep 14',
}

const mockTodos = [
  { id: 1, label: 'Team application', done: true },
  { id: 2, label: 'Medical info', done: true },
  { id: 3, label: 'Team fee ($45)', done: false },
  { id: 4, label: 'Weekend schedule review', done: false },
]

const mockEvents = [
  { id: 1, title: 'Team Meeting', date: 'Aug 23', location: 'Fellowship Hall' },
  { id: 2, title: 'Send-Off Dinner', date: 'Sep 10', location: 'Tanglewood' },
  { id: 3, title: 'Closing Ceremony', date: 'Sep 14', location: 'Tanglewood' },
]

const quickLinks = [
  { label: 'Current Weekend', href: '#', icon: Calendar },
  { label: 'Team Roster', href: '#', icon: Users },
  { label: 'Sponsor a Candidate', href: '#', icon: UserPlus },
  { label: 'Prayer Wheel', href: '#', icon: FileText },
  { label: 'Files & Documents', href: '#', icon: FileText },
  { label: 'Candidate List', href: '#', icon: Users },
]

export default function TestPage5() {
  const completedCount = mockTodos.filter((t) => t.done).length
  const progressPercent = (completedCount / mockTodos.length) * 100

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      {/* Page label */}
      <Badge variant="outline" className="mb-3">
        Test Layout 5 — Command Center
      </Badge>

      {/* Compact header bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Typography variant="h2" className="text-lg font-bold">
            {mockUser.firstName} {mockUser.lastName}
          </Typography>
          <Badge variant="secondary" className="text-xs">
            {mockUser.role}
          </Badge>
          <Badge variant="outline" className="text-xs">
            DTTD #{mockUser.weekendNumber} · {mockUser.weekendType}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          <span className="font-mono font-medium text-primary">
            {mockWeekend.daysAway}d
          </span>
          <span>to weekend</span>
        </div>
      </div>

      {/* Main grid - dense layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left column: Tasks + Events */}
        <div className="md:col-span-5 space-y-3">
          {/* Tasks - compact */}
          <Card>
            <CardHeader className="py-2.5 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Tasks</CardTitle>
                <span className="text-xs text-muted-foreground font-mono">
                  {completedCount}/{mockTodos.length}
                </span>
              </div>
              <Progress value={progressPercent} max={100} className="h-1" />
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <div className="space-y-1.5">
                {mockTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between gap-2 py-1"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {todo.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${todo.done ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {todo.label}
                      </span>
                    </div>
                    {!todo.done && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        href="#"
                      >
                        Do
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events - compact list */}
          <Card>
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-sm font-semibold">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <div className="space-y-2">
                {mockEvents.map((event, idx) => (
                  <div key={event.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {event.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-5">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {event.location}
                      </span>
                    </div>
                    {idx < mockEvents.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle column: Weekend overview */}
        <div className="md:col-span-4 space-y-3">
          <Card>
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-sm font-semibold">
                DTTD #{mockWeekend.number} Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <div className="space-y-3">
                {/* Countdown */}
                <div className="text-center py-3 rounded-md bg-muted/50">
                  <span className="text-3xl font-bold font-mono text-primary">
                    {mockWeekend.daysAway}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    days remaining
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 px-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Men&apos;s</span>
                    <span className="font-mono font-medium">
                      {mockWeekend.mensStart}–{mockWeekend.mensEnd}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Women&apos;s</span>
                    <span className="font-mono font-medium">
                      {mockWeekend.womensStart}–{mockWeekend.womensEnd}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community message */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4">
              <Typography
                variant="small"
                className="italic text-foreground/80 leading-relaxed"
              >
                &ldquo;Therefore encourage one another and build each other up,
                just as in fact you are doing.&rdquo;
              </Typography>
              <Typography variant="muted" className="text-[11px] mt-1.5">
                — 1 Thessalonians 5:11
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Quick links */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-sm font-semibold">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0">
              <div className="space-y-0.5">
                {quickLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-8 px-2 text-xs"
                    href={link.href}
                  >
                    <link.icon className="h-3.5 w-3.5 shrink-0" />
                    {link.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Primary action */}
          <Card className="mt-3 border-primary/20">
            <CardContent className="p-3">
              <Button className="w-full h-9 text-xs" href="#">
                Pay Team Fee — $45
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                Your next incomplete task
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
