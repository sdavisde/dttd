'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import type {
  CommunityBoardRole,
  AssignableMember,
} from '@/hooks/use-role-assignment'

type RoleCardProps = {
  role: CommunityBoardRole
  assignedMembers: AssignableMember[]
  onAssignAction: () => void
}

export function RoleCard({
  role,
  assignedMembers,
  onAssignAction,
}: RoleCardProps) {
  const description = role.description ?? 'Role description coming soon.'
  const hasAssignments = assignedMembers.length > 0

  return (
    <Card className="border-muted">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Typography variant="h5">{role.label}</Typography>
            <Typography variant="muted">{description}</Typography>
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasAssignments ? (
              <div className="flex flex-wrap gap-2 justify-end">
                {assignedMembers.map((member) => (
                  <Badge key={member.id} variant="secondary">
                    {member.firstName} {member.lastName}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge color="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Unassigned
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onAssignAction}>
              Assign
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
