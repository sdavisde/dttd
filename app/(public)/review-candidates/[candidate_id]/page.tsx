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
    </div>
  )
}
