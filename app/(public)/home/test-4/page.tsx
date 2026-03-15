'use client'

/**
 * Test Page 4: "Community First"
 *
 * Vibe: Warm, personal, relational, church-bulletin-meets-modern.
 * Purpose: Make the homepage feel like stepping into a community,
 *          not a task management tool. People first, tasks second.
 * Layout: Full-width sections, scripture front-and-center,
 *         community highlights, and soft action prompts.
 *
 * Design philosophy: DTTD values personal relationships above
 * automation. The homepage should reflect the warmth of the
 * community and feel inviting, not transactional.
 */

import {
  Calendar,
  CheckCircle2,
  Circle,
  UserPlus,
  FileText,
  ArrowRight,
  Heart,
  BookOpen,
  Users,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// Mock data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'Table Leader',
  weekendNumber: 11,
}

const mockEncouragement = {
  verse:
    'Therefore encourage one another and build each other up, just as in fact you are doing.',
  reference: '1 Thessalonians 5:11',
  author: 'Pastor Mike',
  note: 'Praying for our team as we prepare for DTTD #11. What an incredible group God has assembled!',
}

const mockLeadership = [
  { name: 'David Martinez', role: 'Rector', initials: 'DM' },
  { name: 'Lisa Chen', role: 'Head', initials: 'LC' },
  { name: 'Robert Kim', role: 'Asst. Head', initials: 'RK' },
]

const mockTodos = [
  { id: 1, label: 'Complete team application form', done: true },
  { id: 2, label: 'Submit medical information', done: true },
  { id: 3, label: 'Pay team member fee ($45)', done: false },
  { id: 4, label: 'Review weekend schedule', done: false },
]

const mockWeekend = {
  number: 11,
  daysAway: 23,
  mensDate: 'Sep 4–7',
  womensDate: 'Sep 11–14',
}

export default function TestPage4() {
  const completedCount = mockTodos.filter((t) => t.done).length

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
      {/* Page label */}
      <Badge variant="outline" className="mb-6">
        Test Layout 4 — Community First
      </Badge>

      {/* Warm greeting with avatar */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {mockUser.firstName[0]}
            {mockUser.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Good morning, {mockUser.firstName}
          </Typography>
          <Typography variant="muted">
            Serving as {mockUser.role} for DTTD #{mockUser.weekendNumber}
          </Typography>
        </div>
      </div>

      {/* Scripture / Encouragement - the heart of the page */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <Typography className="italic text-foreground/90 leading-relaxed">
                &ldquo;{mockEncouragement.verse}&rdquo;
              </Typography>
              <Typography variant="muted" className="text-sm mt-2">
                — {mockEncouragement.reference}
              </Typography>
            </div>
          </div>

          <Separator className="my-4 bg-primary/10" />

          <div className="flex items-start gap-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <Typography variant="small" className="text-foreground/80">
                {mockEncouragement.note}
              </Typography>
              <Typography variant="muted" className="text-xs mt-1">
                — {mockEncouragement.author}
              </Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-column: Leadership + Weekend Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Leadership */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Weekend Leadership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockLeadership.map((leader) => (
              <div key={leader.name} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {leader.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{leader.name}</p>
                  <p className="text-xs text-muted-foreground">{leader.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekend Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              DTTD #{mockWeekend.number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary">
                {mockWeekend.daysAway}
              </span>
              <p className="text-xs text-muted-foreground mt-1">days to go</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Men&apos;s</span>
                <span className="font-medium">{mockWeekend.mensDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Women&apos;s</span>
                <span className="font-medium">{mockWeekend.womensDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gentle task reminder - not aggressive */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              A few things before the weekend
            </CardTitle>
            <Typography variant="muted" className="text-xs">
              {completedCount} of {mockTodos.length} done
            </Typography>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {mockTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3">
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

      {/* Soft action prompts */}
      <div className="space-y-3">
        <Typography variant="muted" className="text-sm font-medium">
          Ways to get involved
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            href="#"
          >
            <UserPlus className="h-5 w-5" />
            <span className="text-sm">Sponsor Someone</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            href="#"
          >
            <Heart className="h-5 w-5" />
            <span className="text-sm">Prayer Wheel</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            href="#"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">Files & Docs</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
