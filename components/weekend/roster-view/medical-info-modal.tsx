'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WeekendRosterMember } from '@/services/weekend'

type MedicalInfoModalProps = {
  open: boolean
  onClose: () => void
  member: WeekendRosterMember | null
}

export function MedicalInfoModal({
  open,
  onClose,
  member,
}: MedicalInfoModalProps) {
  if (!member) {
    return null
  }

  const memberName =
    member.users?.first_name && member.users?.last_name
      ? `${member.users.first_name} ${member.users.last_name}`
      : 'Team Member'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Medical Information</DialogTitle>
          <DialogDescription>{memberName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Emergency Contact
            </h4>
            <div className="rounded-md border p-3 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Name:</span>{' '}
                {member.emergency_contact_name ?? 'Not provided'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span>{' '}
                {member.emergency_contact_phone ?? 'Not provided'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Medical Conditions
            </h4>
            <div className="rounded-md border p-3">
              <p className="text-sm whitespace-pre-wrap">
                {member.medical_conditions ?? 'None reported'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
