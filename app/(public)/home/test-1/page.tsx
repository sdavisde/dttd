'use client'

/**
 * Test Page 1: "Minimal Focus"
 *
 * Vibe: Calm, clean, intentional. One thing at a time.
 * Purpose: Guide users to their single most important action.
 * Layout: Single centered column, generous whitespace, one primary CTA.
 *
 * Design philosophy: Most users have ONE thing they need to do.
 * Instead of showing everything, surface the most relevant action
 * and tuck everything else behind a secondary section.
 */

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  UserPlus,
  FileText,
  ChevronDown,
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
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

// Mock data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  isTeamMember: true,
  role: 'Table Leader',
  weekendNumber: 11,
}

const mockTodos = [
  { id: 1, label: 'Complete team application form', done: true, href: '#' },
  { id: 2, label: 'Submit medical information', done: true, href: '#' },
  { id: 3, label: 'Pay team member fee ($45)', done: false, href: '#' },
  { id: 4, label: 'Review weekend schedule', done: false, href: '#' },
]

const mockWeekend = {
  number: 11,
  mensDate: 'September 4–7, 2025',
  womensDate: 'September 11–14, 2025',
  daysAway: 23,
}

export default function TestPage1() {
  const [showMore, setShowMore] = useState(false)
  const completedCount = mockTodos.filter((t) => t.done).length
  const totalCount = mockTodos.length

  return (
    <div className="container mx-auto max-w-xl px-4 py-8 md:py-12">
      {/* Page label */}
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Test Layout 1 — Minimal Focus
        </Badge>
      </div>

      {/* Greeting - simple, warm */}
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl md:text-4xl font-bold">
          Hey {mockUser.firstName}
        </Typography>
        <Typography variant="muted" className="mt-1">
          {mockUser.role} · DTTD #{mockUser.weekendNumber}
        </Typography>
      </div>

      {/* Primary Action Card - the ONE thing they should do */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wide font-medium">
            Next step
          </CardDescription>
          <CardTitle className="text-lg">Pay your team member fee</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re almost ready for the weekend! Complete your $45 team fee
            to finalize your spot.
          </p>
          <Button className="w-full" href="#">
            Pay Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="small" className="font-medium">
            Your checklist
          </Typography>
          <Typography variant="muted" className="text-xs">
            {completedCount} of {totalCount} complete
          </Typography>
        </div>
        <div className="space-y-2">
          {mockTodos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 py-1.5">
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
      </div>

      <Separator className="my-6" />

      {/* Weekend Countdown - subtle, not competing */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-primary">
          {mockWeekend.daysAway}
        </div>
        <Typography variant="muted" className="text-sm">
          days until DTTD #{mockWeekend.number}
        </Typography>
      </div>

      <Separator className="my-6" />

      {/* Everything else - collapsed by default */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Quick links</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
        />
      </button>

      {showMore && (
        <div className="mt-3 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            href="#"
          >
            <Calendar className="h-4 w-4" />
            Current Weekend
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            href="#"
          >
            <UserPlus className="h-4 w-4" />
            Sponsor a Candidate
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            href="#"
          >
            <FileText className="h-4 w-4" />
            Prayer Wheel Signup
          </Button>
        </div>
      )}
    </div>
  )
}
