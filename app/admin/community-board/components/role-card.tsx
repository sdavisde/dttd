'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import type { BoardRole, BoardMember } from '@/services/community/board'

type RoleCardProps = {
  role: BoardRole
  assignedMembers: BoardMember[]
  onAssignClick: () => void
}

export function RoleCard({
  role,
  assignedMembers,
  onAssignClick,
}: RoleCardProps) {
  const description = role.description ?? 'Role description coming soon.'
  const hasAssignments = assignedMembers.length > 0

  return (
    <Card className="border-muted">
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
