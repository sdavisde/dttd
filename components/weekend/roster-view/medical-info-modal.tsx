'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WeekendRosterMember } from '@/services/weekend'

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
          <DialogTitle>Special Needs</DialogTitle>
          <DialogDescription>{memberName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Special Needs
            </h4>
            <div className="rounded-md border p-3">
              <p className="text-sm whitespace-pre-wrap">
                {member.special_needs ?? 'None reported'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
