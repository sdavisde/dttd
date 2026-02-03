import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CandidateProgressBar } from './CandidateProgressBar'

const CANDIDATE_CAPACITY = 42

interface SponsoredCandidatesCardProps {
  mensCandidateCount: number
  womensCandidateCount: number
}

export function SponsoredCandidatesCard({
  mensCandidateCount,
  womensCandidateCount,
}: SponsoredCandidatesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsored Candidates</CardTitle>
        <CardAction>
          <Link
            href="/candidate-list"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            View Candidate List
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <CandidateProgressBar
          label="Men's Weekend"
          count={mensCandidateCount}
          capacity={CANDIDATE_CAPACITY}
        />
        <CandidateProgressBar
          label="Women's Weekend"
          count={womensCandidateCount}
          capacity={CANDIDATE_CAPACITY}
        />
      </CardContent>
    </Card>
  )
}
