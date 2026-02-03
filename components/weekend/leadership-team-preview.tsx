import { Typography } from '@/components/ui/typography'
import {
  getActiveWeekendLeadershipTeam,
  LeadershipTeamMember,
} from '@/services/weekend'
import { isErr } from '@/lib/results'

export async function LeadershipTeamPreview() {
  const result = await getActiveWeekendLeadershipTeam()

  if (isErr(result)) {
    return null
  }

  const { menLeaders, womenLeaders } = result.data

  if (menLeaders.length === 0 && womenLeaders.length === 0) {
    return null
  }

  const renderLeaderCard = (member: LeadershipTeamMember) => (
    <div key={member.id} className="space-y-1">
      <Typography variant="p" className="font-semibold text-sm">
        {member.fullName}
      </Typography>
      <Typography variant="p" className="text-xs text-muted-foreground">
        {member.chaRole}
      </Typography>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Men's Leadership */}
      {menLeaders.length > 0 && (
        <div className="space-y-3">
          <Typography
            variant="p"
            className="font-semibold text-sm text-blue-600"
          >
            Men&apos;s Leadership
          </Typography>
          <div className="space-y-3">{menLeaders.map(renderLeaderCard)}</div>
        </div>
      )}

      {/* Women's Leadership */}
      {womenLeaders.length > 0 && (
        <div className="space-y-3">
          <Typography
            variant="p"
            className="font-semibold text-sm text-pink-600"
          >
            Women&apos;s Leadership
          </Typography>
          <div className="space-y-3">{womenLeaders.map(renderLeaderCard)}</div>
        </div>
      )}
    </div>
  )
}
