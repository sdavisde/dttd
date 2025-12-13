'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WeekendGroupWithId, WeekendStatus } from '@/lib/weekend/types'
import { getGroupStatus } from '@/lib/weekend'
import { setActiveWeekendGroup } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'

interface SetActiveWeekendButtonProps {
  weekendGroups: WeekendGroupWithId[]
}

export function SetActiveWeekendButton({
  weekendGroups,
}: SetActiveWeekendButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const currentActiveGroup = weekendGroups.find(
    (group) => getGroupStatus(group) === WeekendStatus.ACTIVE
  )

  const handleSetActive = async (groupId: string) => {
    // Don't proceed if already active
    if (currentActiveGroup?.groupId === groupId) {
      toast.info('This weekend is already active')
      return
    }

    setIsLoading(true)

    try {
      const result = await setActiveWeekendGroup(groupId)

      if (isErr(result)) {
        toast.error('Failed to set active weekend', {
          description: result.error,
        })
        return
      }

      const selectedGroup = weekendGroups.find((g) => g.groupId === groupId)
      const title =
        selectedGroup?.weekends.MENS?.title?.replace(/mens|womens/gi, '').trim() ??
        'Weekend'

      toast.success('Active weekend updated', {
        description: `${title} is now the active weekend`,
      })

      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error setting active weekend:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatGroupTitle = (group: WeekendGroupWithId): string => {
    return (
      group.weekends.MENS?.title?.replace(/mens|womens/gi, '').trim() ??
      `Weekend #${group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? '?'}`
    )
  }

  if (weekendGroups.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Select Active Weekend
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Set Active Weekend</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {weekendGroups.map((group) => {
          const isActive = currentActiveGroup?.groupId === group.groupId
          const status = getGroupStatus(group)

          return (
            <DropdownMenuItem
              key={group.groupId}
              onClick={() => handleSetActive(group.groupId)}
              disabled={isLoading}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{formatGroupTitle(group)}</span>
                {status && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {status.toLowerCase()}
                  </span>
                )}
              </div>
              {isActive && <Check className="w-4 h-4 ml-2 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
