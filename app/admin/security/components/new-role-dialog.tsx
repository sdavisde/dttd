'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Role } from '@/services/identity/roles'
import { defaultCopySource } from '../lib/editor-model'

interface NewRoleDialogProps {
  open: boolean
  roles: Role[]
  onOpenChange: (open: boolean) => void
  onConfirm: (source: Role) => void
}

/**
 * Creation is copy-first: pick the role the new one should start from. The
 * editor then opens prefilled and nothing is saved until the person saves.
 */
export function NewRoleDialog({
  open,
  roles,
  onOpenChange,
  onConfirm,
}: NewRoleDialogProps) {
  const fallback = defaultCopySource(roles)
  const [sourceId, setSourceId] = useState<string | null>(null)
  const source =
    roles.find((role) => role.id === (sourceId ?? fallback?.id)) ?? fallback

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
            New role
          </DialogTitle>
          <DialogDescription>
            New roles start as a copy of an existing one — pick the closest
            match, then adjust what it can do.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-role-source">Start from a copy of</Label>
          <Select
            value={source?.id ?? ''}
            onValueChange={(value) => setSourceId(value)}
          >
            <SelectTrigger id="new-role-source" className="h-11 w-full md:h-9">
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isNil(source)}
            onClick={() => {
              if (!isNil(source)) onConfirm(source)
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
