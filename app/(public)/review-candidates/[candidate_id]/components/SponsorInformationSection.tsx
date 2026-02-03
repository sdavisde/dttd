'use client'

import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { HydratedCandidate } from '@/lib/candidates/types'
import { EditableField } from '@/components/ui/editable-field'
import { updateCandidateSponsorshipField } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { Database } from '@/database.types'
import { useCallback } from 'react'

type SponsorshipInfoUpdate =
  Database['public']['Tables']['candidate_sponsorship_info']['Update']

interface SponsorInformationSectionProps {
  candidate: HydratedCandidate
  canEdit: boolean
}

interface ReadOnlyFieldProps {
  label: string
  value: string | null | undefined
  emptyText?: string
}

function ReadOnlyField({
  label,
  value,
  emptyText = 'Not provided',
}: ReadOnlyFieldProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      <Typography variant="p">{value ?? emptyText}</Typography>
    </div>
  )
}

export function SponsorInformationSection({
  candidate,
  canEdit,
}: SponsorInformationSectionProps) {
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  const handleSave = useCallback(
    async (field: keyof SponsorshipInfoUpdate, value: string | null) => {
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
    },
    [candidate.id]
  )

  const attendsSecuelaDisplay =
    sponsorshipInfo?.attends_secuela === 'yes'
      ? 'Yes'
      : sponsorshipInfo?.attends_secuela === 'no'
        ? 'No'
        : (sponsorshipInfo?.attends_secuela ?? 'Not specified')

  const paymentOwnerDisplay =
    sponsorshipInfo?.payment_owner === 'sponsor'
      ? 'Sponsor'
      : sponsorshipInfo?.payment_owner === 'candidate'
        ? 'Candidate'
        : 'Not specified'

  return (
    <section>
      <Separator className="my-4" />
      <Typography variant="h3" className="mb-4">
        Sponsor Information
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableField
          label="Sponsor Name"
          value={sponsorshipInfo?.sponsor_name}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_name', value)}
        />
        <EditableField
          label="Sponsor Email"
          value={sponsorshipInfo?.sponsor_email}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_email', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableField
          label="Sponsor Phone"
          value={sponsorshipInfo?.sponsor_phone}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_phone', value)}
        />
        <EditableField
          label="Sponsor Church"
          value={sponsorshipInfo?.sponsor_church}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_church', value)}
        />
      </div>

      <div className="mb-4">
        <EditableField
          label="Sponsor Address"
          value={sponsorshipInfo?.sponsor_address}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_address', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableField
          label="Sponsor Weekend Attended"
          value={sponsorshipInfo?.sponsor_weekend}
          canEdit={canEdit}
          onSave={(value) => handleSave('sponsor_weekend', value)}
        />
        <EditableField
          label="Reunion Group"
          value={sponsorshipInfo?.reunion_group}
          canEdit={canEdit}
          onSave={(value) => handleSave('reunion_group', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ReadOnlyField label="Attends Secuela" value={attendsSecuelaDisplay} />
        <EditableField
          label="Contact Frequency with Candidate"
          value={sponsorshipInfo?.contact_frequency}
          canEdit={canEdit}
          onSave={(value) => handleSave('contact_frequency', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Payment Owner" value={paymentOwnerDisplay} />
      </div>
    </section>
  )
}
