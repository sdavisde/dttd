'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WeekendRosterMember } from '@/services/weekend'
import type { TeamFormSummary } from '@/actions/team-forms'
import { getTeamFormSummary } from '@/actions/team-forms'
import { isNil } from 'lodash'
import { Results } from '@/lib/results'
import { Loader2 } from 'lucide-react'

type TeamFormInfoModalProps = {
  open: boolean
  onClose: () => void
  member: WeekendRosterMember | null
}

export function TeamFormInfoModal({
  open,
  onClose,
  member,
}: TeamFormInfoModalProps) {
  const [summary, setSummary] = useState<TeamFormSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchedUserId = useRef<string | null>(null)

  const fetchData = useCallback(async (userId: string) => {
    if (lastFetchedUserId.current === userId) return
    lastFetchedUserId.current = userId
    setLoading(true)
    setError(null)
    try {
      const result = await getTeamFormSummary(userId)
      if (Results.isOk(result)) {
        setSummary(result.data)
      } else {
        setError(result.error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      lastFetchedUserId.current = null
      onClose()
    }
  }

  if (isNil(member)) {
    return null
  }

  // Trigger fetch when dialog opens with a new member
  if (
    open &&
    !isNil(member.user_id) &&
    lastFetchedUserId.current !== member.user_id
  ) {
    void fetchData(member.user_id)
  }

  const memberName =
    !isNil(member.users?.first_name) && !isNil(member.users?.last_name)
      ? `${member.users!.first_name} ${member.users!.last_name}`
      : 'Team Member'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Form Info</DialogTitle>
          <DialogDescription>{memberName}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isNil(error) && (
          <p className="text-sm text-destructive">Failed to load form info.</p>
        )}

        {!loading && !isNil(summary) && (
          <div className="space-y-5">
            {/* Address */}
            <Section title="Address">
              {isNil(summary.address) ? (
                <EmptyValue />
              ) : (
                <div className="text-sm">
                  <p>{summary.address.addressLine1}</p>
                  {!isNil(summary.address.addressLine2) &&
                    summary.address.addressLine2.length > 0 && (
                      <p>{summary.address.addressLine2}</p>
                    )}
                  <p>
                    {summary.address.city}, {summary.address.state}{' '}
                    {summary.address.zip}
                  </p>
                </div>
              )}
            </Section>

            {/* Church & Community */}
            <Section title="Church & Community">
              <InfoRow label="Church" value={summary.churchAffiliation} />
              <InfoRow
                label="Weekend Attended"
                value={summary.weekendAttended}
              />
              <InfoRow
                label="Essentials Training"
                value={summary.essentialsTrainingDate}
              />
            </Section>

            {/* Skills */}
            {!isNil(summary.specialGiftsAndSkills) &&
              summary.specialGiftsAndSkills.length > 0 && (
                <Section title="Skills & Abilities">
                  <div className="flex flex-wrap gap-1.5">
                    {summary.specialGiftsAndSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

            {/* Experience */}
            {summary.experience.length > 0 && (
              <Section title="Previous Experience">
                <div className="space-y-1.5">
                  {summary.experience.map((exp, i) => (
                    <div key={i} className="text-sm flex items-baseline gap-2">
                      <span className="font-medium">{exp.chaRole}</span>
                      <span className="text-muted-foreground">
                        {exp.weekendReference}
                      </span>
                      {!isNil(exp.rollo) && (
                        <span className="text-muted-foreground">
                          — {exp.rollo}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="rounded-md border p-3">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span>{value ?? '-'}</span>
    </div>
  )
}

function EmptyValue() {
  return <span className="text-sm text-muted-foreground">Not provided</span>
}
