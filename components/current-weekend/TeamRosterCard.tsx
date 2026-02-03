import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LeadershipTeamPreview } from '../weekend'

export async function TeamRosterCard() {
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
        <LeadershipTeamPreview />
      </CardContent>
    </Card>
  )
}
