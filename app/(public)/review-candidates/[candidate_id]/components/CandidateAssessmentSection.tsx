'use client'

import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'
import { EditableTextArea } from '@/components/ui/editable-text-area'
import { updateCandidateSponsorshipField } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CandidateAssessmentSectionProps {
  candidate: HydratedCandidate
  canEdit: boolean
}

type AssessmentFieldName =
  | 'church_environment'
  | 'home_environment'
  | 'social_environment'
  | 'work_environment'
  | 'god_evidence'
  | 'support_plan'
  | 'prayer_request'

export function CandidateAssessmentSection({
  candidate,
  canEdit,
}: CandidateAssessmentSectionProps) {
  const router = useRouter()
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  const handleSave = useCallback(
    async (field: AssessmentFieldName, value: string | null) => {
      const result = await updateCandidateSponsorshipField({
        candidateId: candidate.id,
        field,
        value: value ?? null,
      })

      if (Results.isErr(result)) {
        toast.error(result.error)
        throw new Error(result.error)
      }

      toast.success('Changes saved')
      router.refresh()
    },
    [candidate.id, router]
  )

  return (
    <section>
      <Typography variant="h3" className="mb-4">
        Candidate Assessment
      </Typography>
      <Typography variant="small" className="text-muted-foreground mb-4 block">
        Environment descriptions provided by sponsor:
      </Typography>

      <div className="space-y-4 mb-4">
        <EditableTextArea
          label="Church Environment"
          value={sponsorshipInfo?.church_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('church_environment', value)}
          rows={3}
        />
        <EditableTextArea
          label="Home Environment"
          value={sponsorshipInfo?.home_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('home_environment', value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableTextArea
          label="Social Environment"
          value={sponsorshipInfo?.social_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('social_environment', value)}
          rows={3}
        />
        <EditableTextArea
          label="Work Environment"
          value={sponsorshipInfo?.work_environment}
          canEdit={canEdit}
          onSave={(value) => handleSave('work_environment', value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableTextArea
          label="Evidence of God's Leading"
          value={sponsorshipInfo?.god_evidence}
          canEdit={canEdit}
          onSave={(value) => handleSave('god_evidence', value)}
          rows={3}
        />
        <EditableTextArea
          label="Support Plan"
          value={sponsorshipInfo?.support_plan}
          canEdit={canEdit}
          onSave={(value) => handleSave('support_plan', value)}
          rows={3}
        />
      </div>

      <div className="mb-4">
        <EditableTextArea
          label="Prayer Request"
          value={sponsorshipInfo?.prayer_request}
          canEdit={canEdit}
          onSave={(value) => handleSave('prayer_request', value)}
          rows={3}
        />
      </div>
    </section>
  )
}
