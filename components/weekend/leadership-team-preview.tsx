'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { WeekendRosterMember } from '@/services/weekend'
import { CHARole } from '@/lib/weekend/types'
import { isNil } from 'lodash'

type LeadershipTeamPreviewProps = {
  roster: Array<WeekendRosterMember>
}

const LEADERSHIP_ROLES = [
  CHARole.RECTOR,
  CHARole.HEAD,
  CHARole.ASSISTANT_HEAD,
  CHARole.BACKUP_RECTOR,
]

export function LeadershipTeamPreview({ roster }: LeadershipTeamPreviewProps) {
  // Filter for active leadership members
  const leadershipMembers = roster.filter(
    (member) =>
      member.status !== 'drop' &&
      member.cha_role &&
      LEADERSHIP_ROLES.includes(member.cha_role as CHARole)
  )

  if (leadershipMembers.length === 0) {
    return null
  }

  // Split by gender
  const menLeaders = leadershipMembers.filter(
    (member) => member.users?.gender?.toLowerCase() === 'male'
  )
  const womenLeaders = leadershipMembers.filter(
    (member) => member.users?.gender?.toLowerCase() === 'female'
  )

  const renderLeaderCard = (member: WeekendRosterMember) => {
    const fullName = member.users
      ? `${member.users.first_name || ''} ${member.users.last_name || ''}`.trim()
      : 'Unknown'

    return (
      <div key={member.id} className="space-y-1">
        <Typography variant="p" className="font-semibold text-sm">
          {fullName}
        </Typography>
        <Typography variant="p" className="text-xs text-muted-foreground">
          {member.cha_role}
        </Typography>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Men's Leadership */}
          {menLeaders.length > 0 && (
            <div className="space-y-3">
              <Typography variant="p" className="font-semibold text-sm text-blue-600">
                Men's Leadership
              </Typography>
              <div className="space-y-3">
                {menLeaders.map(renderLeaderCard)}
              </div>
            </div>
          )}

          {/* Women's Leadership */}
          {womenLeaders.length > 0 && (
            <div className="space-y-3">
              <Typography variant="p" className="font-semibold text-sm text-pink-600">
                Women's Leadership
              </Typography>
              <div className="space-y-3">
                {womenLeaders.map(renderLeaderCard)}
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {menLeaders.length === 0 && womenLeaders.length === 0 && (
          <Typography variant="p" className="text-sm text-muted-foreground">
            No leadership team assigned
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
