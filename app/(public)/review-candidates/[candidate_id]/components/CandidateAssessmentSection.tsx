'use client'

import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'
import { InlineTextArea } from '@/components/ui/inline-text-area'
import { updateCandidateSponsorshipField } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { useCallback } from 'react'

interface CandidateAssessmentSectionProps {
  candidate: HydratedCandidate
  canEdit: boolean
}

type AssessmentField =
  | 'church_environment'
  | 'home_environment'
  | 'social_environment'
  | 'work_environment'
  | 'god_evidence'
  | 'support_plan'
  | 'prayer_request'

interface AssessmentFieldProps {
  label: string
  value: string | null | undefined
  canEdit: boolean
  onSave: (value: string) => Promise<void>
}

function AssessmentField({
  label,
  value,
  canEdit,
  onSave,
}: AssessmentFieldProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      {canEdit ? (
        <InlineTextArea
          value={value ?? null}
          onSave={onSave}
          emptyText="Not provided"
          rows={3}
        />
      ) : (
        <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
          {value ?? 'Not provided'}
        </Typography>
      )}
    </div>
  )
}

export function CandidateAssessmentSection({
  candidate,
  canEdit,
}: CandidateAssessmentSectionProps) {
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  const handleSave = useCallback(
    async (field: AssessmentField, value: string) => {
      const result = await updateCandidateSponsorshipField({
        candidateId: candidate.id,
        field,
        value: value || null,
      })

      if (Results.isErr(result)) {
        toast.error(result.error)
        throw new Error(result.error)
      }

      toast.success('Changes saved')
    },
    [candidate.id]
  )

  return (
    <section>
      <Typography variant="h3" className="mb-4">
        Candidate Assessment
      </Typography>
      <Typography variant="small" className="text-muted-foreground mb-4 block">
        Environment descriptions provided by sponsor:
      </Typography>

      <div>
        <AssessmentField
          label="Church Environment"
          value={sponsorshipInfo?.church_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('church_environment', value)}
        />
        <AssessmentField
          label="Home Environment"
          value={sponsorshipInfo?.home_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('home_environment', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <AssessmentField
          label="Social Environment"
          value={sponsorshipInfo?.social_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('social_environment', value)}
        />
        <AssessmentField
          label="Work Environment"
          value={sponsorshipInfo?.work_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('work_environment', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <AssessmentField
          label="Evidence of God's Leading"
          value={sponsorshipInfo?.god_evidence}
          canEdit={canEdit}
          onSave={(value) => handleSave('god_evidence', value)}
        />
        <AssessmentField
          label="Support Plan"
          value={sponsorshipInfo?.support_plan}
          canEdit={canEdit}
          onSave={(value) => handleSave('support_plan', value)}
        />
      </div>

      <div className="mb-4">
        <AssessmentField
          label="Prayer Request"
          value={sponsorshipInfo?.prayer_request}
          canEdit={canEdit}
          onSave={(value) => handleSave('prayer_request', value)}
        />
      </div>
    </section>
  )
}
