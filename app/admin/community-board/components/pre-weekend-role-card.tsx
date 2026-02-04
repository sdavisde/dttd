'use client'

import { Mail, Pencil, Save, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import type { BoardRole, BoardMember } from '@/services/community/board'

type PreWeekendRoleCardProps = {
  role: BoardRole
  assignedMembers: BoardMember[]
  onAssignClick: () => void
  email: string
  isEditingEmail: boolean
  isSavingEmail: boolean
  setEmail: (email: string) => void
  startEditEmail: () => void
  saveEmail: () => void
  cancelEditEmail: () => void
}

export function PreWeekendRoleCard({
  role,
  assignedMembers,
  onAssignClick,
  email,
  isEditingEmail,
  isSavingEmail,
  setEmail,
  startEditEmail,
  saveEmail,
  cancelEditEmail,
}: PreWeekendRoleCardProps) {
  const description = role.description ?? 'Role description coming soon.'
  const hasAssignments = assignedMembers.length > 0

  return (
    <Card className="border-muted">
      <CardContent className="space-y-4">
        {/* Role info and assignment - same as RoleCard */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <Typography variant="h5">{role.label}</Typography>
            <Typography variant="muted">{description}</Typography>
            {hasAssignments && (
              <div className="flex flex-wrap gap-2 pt-2">
                {assignedMembers.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center text-sm text-foreground"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary mr-1.5">
                      {member.firstName?.[0]}
                      {member.lastName?.[0]}
                    </span>
                    {member.firstName} {member.lastName}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            variant={hasAssignments ? 'ghost' : 'outline'}
            size="sm"
            onClick={onAssignClick}
            className="shrink-0"
          >
            {hasAssignments ? (
              'Edit'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Assign
              </>
            )}
          </Button>
        </div>

        {/* Email section - unique to PreWeekendRoleCard */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Contact Email</span>
          </div>
          {isEditingEmail ? (
            <div className="flex gap-2">
              <Input
                id="preweekend-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={isSavingEmail}
                className="flex-1"
              />
              <Button size="sm" onClick={saveEmail} disabled={isSavingEmail}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEditEmail}
                disabled={isSavingEmail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {email || 'No email set'}
              </span>
              <Button size="sm" variant="ghost" onClick={startEditEmail}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
