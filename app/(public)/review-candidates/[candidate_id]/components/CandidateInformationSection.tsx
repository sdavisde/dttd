'use client'

import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'
import { EditableField } from '@/components/ui/editable-field'
import { updateCandidateSponsorshipField } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { useCallback } from 'react'
import { isNil } from 'lodash'
import { useRouter } from 'next/navigation'

interface CandidateInformationSectionProps {
  candidate: HydratedCandidate
  canEdit: boolean
}

export function CandidateInformationSection({
  candidate,
  canEdit,
}: CandidateInformationSectionProps) {
  const router = useRouter()
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  const handleSave = useCallback(
    async (field: 'candidate_name' | 'candidate_email', value: string) => {
      const result = await updateCandidateSponsorshipField({
        candidateId: candidate.id,
        field,
        value,
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
        Candidate Information
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditableField
          label="Name"
          value={sponsorshipInfo?.candidate_name}
          canEdit={canEdit}
          onSave={async (value) => {
            if (isNil(value)) {
              return
            }
            await handleSave('candidate_name', value)
          }}
        />
        <EditableField
          label="Email"
          value={sponsorshipInfo?.candidate_email}
          canEdit={canEdit}
          onSave={async (value) => {
            if (isNil(value)) {
              return
            }
            await handleSave('candidate_email', value)
          }}
        />
      </div>
    </section>
  )
}
