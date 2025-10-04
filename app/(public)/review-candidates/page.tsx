import { Typography } from '@/components/ui/typography'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { HydratedCandidate } from '@/lib/candidates/types'
import { getAllCandidatesWithDetails } from '@/actions/candidates'
import * as Results from '@/lib/results'

async function getCandidates(): Promise<HydratedCandidate[]> {
  // Get all candidates with their related information
  const candidatesResult = await getAllCandidatesWithDetails()

  if (Results.isErr(candidatesResult)) {
    console.error('Error fetching candidates:', candidatesResult.error)
    return []
  }

  return candidatesResult.data
}

export default async function ReviewCandidatePage() {
  const candidates = await getCandidates()

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      <div className="my-4">
        <Typography variant="h1">Candidate List</Typography>
        <Typography variant="p" className="mb-4">
          A list of candidates for the upcoming weekends.
        </Typography>
        <CandidateReviewTable candidates={candidates} />
      </div>
    </div>
  )
}
