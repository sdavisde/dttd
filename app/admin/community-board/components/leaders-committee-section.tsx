'use client'

import { AlertTriangle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import type {
  CommunityBoardRole,
  AssignableMember,
} from '@/hooks/use-role-assignment'

type LeadersCommitteeSectionProps = {
  role: CommunityBoardRole | null
  members: AssignableMember[]
  onEditClick: () => void
}

export function LeadersCommitteeSection({
  role,
  members,
  onEditClick,
}: LeadersCommitteeSectionProps) {
  const description =
    role?.description ?? 'Committee assignments for board leadership.'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Leaders Committee
        </CardTitle>
        <Typography variant="muted">{description}</Typography>
      </CardHeader>
      <CardContent className="space-y-2">
        {role ? (
          members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="rounded-md border px-3 py-2 text-sm font-medium"
              >
                {member.firstName} {member.lastName}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              No committee members assigned.
            </div>
          )
        ) : (
          <div className="text-sm text-muted-foreground">
            Leaders Committee role not configured.
          </div>
        )}
        {role && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onEditClick}
          >
            Edit Committee Members
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
