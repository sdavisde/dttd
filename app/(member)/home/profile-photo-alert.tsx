'use client'

import { useSyncExternalStore } from 'react'
import { Camera, X } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'dttd.profile-photo-alert.dismissed'
const DISMISSED_EVENT = 'dttd-profile-photo-alert-dismissed'

function subscribe(callback: () => void) {
  window.addEventListener(DISMISSED_EVENT, callback)
  return () => window.removeEventListener(DISMISSED_EVENT, callback)
}

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

function getServerSnapshot(): boolean {
  return false
}

interface ProfilePhotoAlertProps {
  /** Computed server-side, e.g. `isNil(user.profilePhotoPath)`. */
  needsPhoto: boolean
}

export function ProfilePhotoAlert({ needsPhoto }: ProfilePhotoAlertProps) {
  // useSyncExternalStore reads localStorage on the client only; the server
  // snapshot is always `false`, so there's no hydration mismatch and no
  // need for a mount effect just to reveal the alert.
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    window.dispatchEvent(new Event(DISMISSED_EVENT))
  }

  if (!needsPhoto || dismissed) return null

  return (
    <Alert
      variant="destructive"
      className="relative flex flex-col gap-3 border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex flex-1 items-center gap-3 pr-8 sm:pr-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <Camera className="size-5" />
        </div>
        <div>
          <AlertTitle>Add a profile photo</AlertTitle>
          <AlertDescription>Help the community recognize you.</AlertDescription>
        </div>
      </div>
      <Button
        href="/profile"
        size="sm"
        variant="destructive"
        className="w-full sm:mr-8 sm:w-auto"
      >
        Add a photo &rarr;
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  )
}
