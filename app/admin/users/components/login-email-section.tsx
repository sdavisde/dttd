'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { updateUserLoginEmail } from '@/services/identity/user'

interface LoginEmailSectionProps {
  userId: string
  memberName: string
  currentEmail: string | null
  canEdit: boolean
}

/**
 * Changing the address a member signs in with, kept deliberately apart from the rest of
 * the edit form.
 *
 * It saves on its own rather than with "Save Changes" for two reasons: it writes to
 * auth, not just the profile row, and it is the one field on this form that can lock
 * somebody out of their account. A separate confirm step makes that a decision rather
 * than a side effect of editing a phone number.
 */
export function LoginEmailSection({
  userId,
  memberName,
  currentEmail,
  canEdit,
}: LoginEmailSectionProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openDialog = () => {
    setNewEmail(currentEmail ?? '')
    setError(null)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    if (isSaving) return
    setIsDialogOpen(false)
    setError(null)
  }

  const isUnchanged =
    newEmail.trim().toLowerCase() === (currentEmail ?? '').trim().toLowerCase()

  const handleConfirm = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await updateUserLoginEmail({
        userId,
        email: newEmail,
      })

      if (isErr(result)) {
        // Surfaced inline rather than as a toast: the dialog stays open so the address
        // can be corrected without retyping it.
        setError(result.error)
        return
      }

      toast.success(`Login email updated to ${newEmail.trim().toLowerCase()}`)
      setIsDialogOpen(false)
      router.refresh()
    } catch (err) {
      toastError('Unable to update the login email. Please try again.', {
        error: err,
        userId,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-2">
      <Typography variant="muted" className="text-sm font-bold">
        Login Email
      </Typography>
      <div className="bg-muted/20 rounded-md p-4 space-y-3 border">
        <div className="space-y-1">
          <Label className="text-xs">Signs in with</Label>
          <Typography variant="p" className="break-all">
            {!isNil(currentEmail) && currentEmail !== '' ? (
              currentEmail
            ) : (
              <span className="text-muted-foreground">No email on file</span>
            )}
          </Typography>
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={openDialog}
            className="min-h-11"
          >
            Change login email
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change login email</DialogTitle>
            <DialogDescription>
              {memberName} will sign in with the new address from now on. Their
              password does not change and still works.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">New email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={isSaving}
                autoComplete="off"
              />
            </div>

            <Alert>
              <AlertDescription>
                The new address is marked verified immediately and no
                confirmation email is sent to either address. Make sure it is
                right before saving.
              </AlertDescription>
            </Alert>

            {!isNil(error) && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isSaving}
              className="min-h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSaving || newEmail.trim() === '' || isUnchanged}
              className="min-h-11"
            >
              {isSaving ? 'Updating...' : 'Update login email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
