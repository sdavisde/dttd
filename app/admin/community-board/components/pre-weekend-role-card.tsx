'use client'

import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import type { CommunityBoardRole } from '@/hooks/use-role-assignment'

type PreWeekendRoleCardProps = {
  role: CommunityBoardRole
  email: string
  isEditing: boolean
  isSaving: boolean
  setEmailAction: (email: string) => void
  startEditAction: () => void
  saveAction: () => void
  cancelAction: () => void
}

export function PreWeekendRoleCard({
  role,
  email,
  isEditing,
  isSaving,
  setEmailAction,
  startEditAction,
  saveAction,
  cancelAction,
}: PreWeekendRoleCardProps) {
  const description = role.description ?? 'Role description coming soon.'

  return (
    <Card className="border-muted">
      <CardContent className="space-y-3">
        <div>
          <Typography variant="h5">{role.label}</Typography>
          <Typography variant="muted">{description}</Typography>
        </div>
        <div className="space-y-2">
          <label htmlFor="preweekend-email" className="text-sm font-medium">
            Contact Email
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                id="preweekend-email"
                type="email"
                value={email}
                onChange={(e) => setEmailAction(e.target.value)}
                placeholder="email@example.com"
                disabled={isSaving}
              />
              <Button size="sm" onClick={saveAction} disabled={isSaving}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelAction}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border px-3 py-2 text-sm">
                {email || 'No email set'}
              </div>
              <Button size="sm" variant="outline" onClick={startEditAction}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
