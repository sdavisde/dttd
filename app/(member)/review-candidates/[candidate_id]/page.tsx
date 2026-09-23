import { notFound } from 'next/navigation'
import { getHydratedCandidate } from '@/actions/candidates'
import { Typography } from '@/components/ui/typography'
import { StatusChip } from '@/components/candidates/status-chip'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import * as Results from '@/lib/results'
import { CandidateInformationSection } from './components/CandidateInformationSection'
import { CandidateAssessmentSection } from './components/CandidateAssessmentSection'
import { CandidateFormDetailsSection } from './components/CandidateFormDetailsSection'
import { SponsorInformationSection } from './components/SponsorInformationSection'
import { StatusSelect } from './components/StatusSelect'
import { getLoggedInUser } from '@/services/identity/user'
import { Permission, userHasPermission } from '@/lib/security'

interface PageProps {
  params: Promise<{
    candidate_id: string
  }>
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { candidate_id } = await params
  const [result, userResult] = await Promise.all([
    getHydratedCandidate(candidate_id),
    getLoggedInUser(),
  ])

  if (Results.isErr(result)) {
    notFound()
  }

  const candidate = result.data

  // Check if user has permission to edit candidates
  const canEdit =
    Results.isOk(userResult) &&
    userHasPermission(userResult.data, [Permission.WRITE_CANDIDATES])

  const candidateName =
    candidate.candidate_sponsorship_info?.candidate_name ?? 'Unknown Candidate'

  return (
    <PageContent>
      <MemberBreadcrumbs
        title={candidateName}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Review candidates', href: '/review-candidates' },
        ]}
      />

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Typography variant="h1" className="min-w-0 break-words">
          {candidateName}
        </Typography>
        {canEdit ? (
          <StatusSelect
            candidateId={candidate.id}
            currentStatus={candidate.status}
          />
        ) : (
          <StatusChip status={candidate.status} />
        )}
      </div>

      {/* Content Sections */}
      <CandidateInformationSection candidate={candidate} canEdit={canEdit} />
      <CandidateAssessmentSection candidate={candidate} canEdit={canEdit} />
      <CandidateFormDetailsSection candidate={candidate} canEdit={canEdit} />
      <SponsorInformationSection candidate={candidate} canEdit={canEdit} />
    </PageContent>
  )
}
