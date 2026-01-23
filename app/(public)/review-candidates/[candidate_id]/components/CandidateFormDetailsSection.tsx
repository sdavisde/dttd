'use client'

import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { HydratedCandidate } from '@/lib/candidates/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { InlineTextField } from '@/components/ui/inline-text-field'
import { EditableField } from '@/components/ui/editable-field'
import { EditableTextArea } from '@/components/ui/editable-text-area'
import { EditableBooleanField } from '@/components/ui/editable-boolean-field'
import { EditableNumberField } from '@/components/ui/editable-number-field'
import { updateCandidateInfoField } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { Database } from '@/database.types'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

type CandidateInfoUpdate =
  Database['public']['Tables']['candidate_info']['Update']

interface CandidateFormDetailsSectionProps {
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

interface EditableNameFieldProps {
  firstName: string | null
  lastName: string | null
  canEdit: boolean
  onSaveFirst: (value: string | null) => Promise<void>
  onSaveLast: (value: string | null) => Promise<void>
}

function EditableNameField({
  firstName,
  lastName,
  canEdit,
  onSaveFirst,
  onSaveLast,
}: EditableNameFieldProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        Name
      </Typography>
      {canEdit ? (
        <div className="flex gap-1">
          <InlineTextField
            value={firstName}
            onSave={(value) => onSaveFirst(value ?? null)}
            emptyText="First"
          />
          <InlineTextField
            value={lastName}
            onSave={(value) => onSaveLast(value ?? null)}
            emptyText="Last"
          />
        </div>
      ) : (
        <Typography variant="p">
          {firstName} {lastName}
        </Typography>
      )}
    </div>
  )
}

interface EditableAddressFieldProps {
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  canEdit: boolean
  onSave: (
    field: keyof CandidateInfoUpdate,
    value: string | null
  ) => Promise<void>
}

function EditableAddressField({
  addressLine1,
  addressLine2,
  city,
  state,
  zip,
  canEdit,
  onSave,
}: EditableAddressFieldProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        Address
      </Typography>
      {canEdit ? (
        <div className="space-y-1">
          <InlineTextField
            value={addressLine1}
            onSave={(value) => onSave('address_line_1', value || null)}
            emptyText="Address Line 1"
          />
          <InlineTextField
            value={addressLine2}
            onSave={(value) => onSave('address_line_2', value || null)}
            emptyText="Address Line 2"
          />
          <div className="flex gap-1 flex-wrap">
            <InlineTextField
              value={city}
              onSave={(value) => onSave('city', value || null)}
              emptyText="City"
            />
            <InlineTextField
              value={state}
              onSave={(value) => onSave('state', value || null)}
              emptyText="State"
            />
            <InlineTextField
              value={zip}
              onSave={(value) => onSave('zip', value || null)}
              emptyText="ZIP"
            />
          </div>
        </div>
      ) : (
        <Typography variant="p">
          {addressLine1}
          {addressLine2 && <>, {addressLine2}</>}
          <br />
          {city}, {state} {zip}
        </Typography>
      )}
    </div>
  )
}

const ageSchema = z.number().int().min(0).max(150)

export function CandidateFormDetailsSection({
  candidate,
  canEdit,
}: CandidateFormDetailsSectionProps) {
  const router = useRouter()
  const candidateInfo = candidate.candidate_info
  const candidateName =
    candidate.candidate_sponsorship_info?.candidate_name ?? 'This candidate'

  const handleSave = useCallback(
    async (
      field: keyof CandidateInfoUpdate,
      value: string | number | boolean | null
    ) => {
      const result = await updateCandidateInfoField({
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

  // Show message if candidate hasn't completed their forms
  if (!candidateInfo) {
    return (
      <section>
        <Separator className="my-4" />
        <Typography variant="h3" className="mb-4">
          Candidate Form Details
        </Typography>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Forms Not Completed</AlertTitle>
          <AlertDescription>
            {candidateName} has not completed their forms yet.
          </AlertDescription>
        </Alert>
      </section>
    )
  }

  return (
    <section>
      <Separator className="my-4" />
      <Typography variant="h3" className="mb-4">
        Candidate Form Details
      </Typography>
      <Typography variant="small" className="text-muted-foreground mb-4 block">
        Information provided by the candidate:
      </Typography>

      {/* Personal Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableNameField
          firstName={candidateInfo.first_name}
          lastName={candidateInfo.last_name}
          canEdit={canEdit}
          onSaveFirst={(value) => handleSave('first_name', value)}
          onSaveLast={(value) => handleSave('last_name', value)}
        />
        <EditableField
          label="Email"
          value={candidateInfo.email}
          canEdit={canEdit}
          onSave={(value) => handleSave('email', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableField
          label="Phone"
          value={candidateInfo.phone}
          canEdit={canEdit}
          onSave={(value) => handleSave('phone', value)}
        />
        <ReadOnlyField
          label="Date of Birth"
          value={
            candidateInfo.date_of_birth
              ? new Date(candidateInfo.date_of_birth).toLocaleDateString()
              : null
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableNumberField
          label="Age"
          value={candidateInfo.age}
          canEdit={canEdit}
          onSave={(value) => handleSave('age', value)}
          schema={ageSchema}
        />
        <EditableField
          label="Shirt Size"
          value={candidateInfo.shirt_size}
          canEdit={canEdit}
          onSave={(value) => handleSave('shirt_size', value)}
        />
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableAddressField
          addressLine1={candidateInfo.address_line_1}
          addressLine2={candidateInfo.address_line_2}
          city={candidateInfo.city}
          state={candidateInfo.state}
          zip={candidateInfo.zip}
          canEdit={canEdit}
          onSave={handleSave}
        />
        <EditableField
          label="Church"
          value={candidateInfo.church}
          canEdit={canEdit}
          onSave={(value) => handleSave('church', value)}
        />
      </div>

      {/* Marital Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableField
          label="Marital Status"
          value={candidateInfo.marital_status}
          canEdit={canEdit}
          onSave={(value) => handleSave('marital_status', value)}
        />
        {candidateInfo.spouse_name && (
          <EditableField
            label="Spouse Name"
            value={candidateInfo.spouse_name}
            canEdit={canEdit}
            onSave={(value) => handleSave('spouse_name', value)}
          />
        )}
      </div>

      {/* Spouse Weekend Info */}
      {(candidateInfo.has_spouse_attended_weekend !== null || canEdit) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <EditableBooleanField
            label="Has Spouse Attended Weekend?"
            value={candidateInfo.has_spouse_attended_weekend}
            canEdit={canEdit}
            onSave={(value) => handleSave('has_spouse_attended_weekend', value)}
          />
          {(candidateInfo.spouse_weekend_location ?? canEdit) && (
            <EditableField
              label="Spouse Weekend Location"
              value={candidateInfo.spouse_weekend_location}
              canEdit={canEdit}
              onSave={(value) => handleSave('spouse_weekend_location', value)}
            />
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableBooleanField
          label="Has Friends Attending Weekend?"
          value={candidateInfo.has_friends_attending_weekend}
          canEdit={canEdit}
          onSave={(value) => handleSave('has_friends_attending_weekend', value)}
        />
        <EditableBooleanField
          label="Is Christian?"
          value={candidateInfo.is_christian}
          canEdit={canEdit}
          onSave={(value) => handleSave('is_christian', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EditableBooleanField
          label="Member of Clergy?"
          value={candidateInfo.member_of_clergy}
          canEdit={canEdit}
          onSave={(value) => handleSave('member_of_clergy', value)}
        />
      </div>

      {/* Reason for Attending */}
      {(candidateInfo.reason_for_attending ?? canEdit) && (
        <div className="mb-4">
          <EditableTextArea
            label="Reason for Attending"
            value={candidateInfo.reason_for_attending}
            canEdit={canEdit}
            onSave={(value) => handleSave('reason_for_attending', value)}
          />
        </div>
      )}

      {/* Medical Conditions */}
      {(candidateInfo.medical_conditions ?? canEdit) && (
        <div className="mb-4">
          <EditableTextArea
            label="Medical Conditions"
            value={candidateInfo.medical_conditions}
            canEdit={canEdit}
            onSave={(value) => handleSave('medical_conditions', value)}
          />
        </div>
      )}

      {/* Emergency Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditableField
          label="Emergency Contact Name"
          value={candidateInfo.emergency_contact_name}
          canEdit={canEdit}
          onSave={(value) => handleSave('emergency_contact_name', value)}
        />
        <EditableField
          label="Emergency Contact Phone"
          value={candidateInfo.emergency_contact_phone}
          canEdit={canEdit}
          onSave={(value) => handleSave('emergency_contact_phone', value)}
        />
      </div>
    </section>
  )
}
