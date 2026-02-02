import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function TeamRosterCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Roster</CardTitle>
        <CardAction>
          <Link
            href="/roster"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            View Roster
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {/* Team graphic - overlapping avatars style */}
        <div className="flex items-center justify-center py-4">
          <div className="flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
              >
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium text-primary">+</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          View the full team serving on this weekend
        </p>
      </CardContent>
    </Card>
  )
}
