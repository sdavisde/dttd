'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendStatus } from '@/lib/weekend/types'
import { getGroupStatus } from '@/lib/weekend'
import { setActiveWeekendGroup } from '@/services/weekend'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import { isNil } from 'lodash'

interface SetActiveWeekendButtonProps {
  weekendGroups: WeekendGroupWithId[]
}

export function SetActiveWeekendButton({
  weekendGroups,
}: SetActiveWeekendButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmGroupId, setConfirmGroupId] = useState<string | null>(null)

  const currentActiveGroup = weekendGroups.find(
    (group) => getGroupStatus(group) === WeekendStatus.ACTIVE
  )

  const confirmGroup = weekendGroups.find((g) => g.groupId === confirmGroupId)

  const handleSetActive = async (groupId: string) => {
    // Don't proceed if already active
    if (currentActiveGroup?.groupId === groupId) {
      toast.info('This weekend is already active')
      return
    }

    // If there's a currently active weekend, show confirmation first
    if (!isNil(currentActiveGroup)) {
      setConfirmGroupId(groupId)
      return
    }

    // No active weekend to finish — proceed directly
    await activateWeekend(groupId)
  }

  const activateWeekend = async (groupId: string) => {
    setIsLoading(true)

    try {
      const result = await setActiveWeekendGroup({ groupId })

      if (isErr(result)) {
        toast.error('Failed to set active weekend', {
          description: result.error,
        })
        return
      }

      const selectedGroup = weekendGroups.find((g) => g.groupId === groupId)
      const title =
        selectedGroup?.weekends.MENS?.title
          ?.replace(/mens|womens/gi, '')
          .trim() ?? 'Weekend'

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

  const activeTitle = !isNil(currentActiveGroup)
    ? formatGroupTitle(currentActiveGroup)
    : null
  const newTitle = !isNil(confirmGroup) ? formatGroupTitle(confirmGroup) : null

  return (
    <>
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
                  {!isNil(status) && (
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

      <AlertDialog
        open={!isNil(confirmGroupId)}
        onOpenChange={(open) => {
          if (!open) setConfirmGroupId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Finish {activeTitle} and activate {newTitle}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Activating <strong>{newTitle}</strong> will mark{' '}
                  <strong>{activeTitle}</strong> as finished. This means:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    The rosters for <strong>{activeTitle}</strong> will become
                    locked and the weekend will become a historical record only
                  </li>
                  <li>
                    Team members will be updated on the master roster to include
                    their experience from <strong>{newTitle}</strong>
                  </li>
                </ul>
                <p className="font-medium">
                  Please verify that the rosters for {activeTitle} are
                  completely correct before continuing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!isNil(confirmGroupId)) {
                  activateWeekend(confirmGroupId)
                }
                setConfirmGroupId(null)
              }}
            >
              Finish &amp; Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
