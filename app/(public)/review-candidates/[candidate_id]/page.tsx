import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHydratedCandidate } from '@/actions/candidates'
import { Typography } from '@/components/ui/typography'
import { StatusChip } from '@/components/candidates/status-chip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import * as Results from '@/lib/results'
import { CandidateInformationSection } from './components/CandidateInformationSection'
import { CandidateAssessmentSection } from './components/CandidateAssessmentSection'
import { CandidateFormDetailsSection } from './components/CandidateFormDetailsSection'
import { SponsorInformationSection } from './components/SponsorInformationSection'

interface PageProps {
  params: Promise<{
    candidate_id: string
  }>
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { candidate_id } = await params

  const result = await getHydratedCandidate(candidate_id)

  if (Results.isErr(result)) {
    notFound()
  }

  const candidate = result.data

  const candidateName =
    candidate.candidate_sponsorship_info?.candidate_name ?? 'Unknown Candidate'

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/review-candidates">Review Candidates</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{candidateName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Typography variant="h1">{candidateName}</Typography>
        <StatusChip status={candidate.status} />
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Candidate Information Section */}
        <CandidateInformationSection candidate={candidate} />

        {/* Candidate Assessment Section */}
        <CandidateAssessmentSection candidate={candidate} />

        {/* Candidate Form Details Section */}
        <CandidateFormDetailsSection candidate={candidate} />

        {/* Sponsor Information Section */}
        <SponsorInformationSection candidate={candidate} />
      </div>
    </div>
  )
}
