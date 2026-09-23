'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { isNil } from 'lodash'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import {
  setNotificationToggle,
  updateSystemEmailAddress,
} from '@/services/settings/actions'
import type {
  NotificationToggleKey,
  NotificationToggles,
} from '@/services/settings/site-settings'
import {
  NOTIFY_NEW_SPONSORSHIPS_KEY,
  NOTIFY_PAYMENT_RECEIPTS_KEY,
  VERIFIED_SENDING_DOMAIN,
  validateSystemEmailAddress,
} from '@/services/settings/site-settings'
import { SettingRow } from './setting-row'

type EmailCardProps = {
  systemEmailAddress: string
  toggles: NotificationToggles
  canEdit: boolean
}

export function EmailCard({
  systemEmailAddress,
  toggles,
  canEdit,
}: EmailCardProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-4">
        <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
          Email
        </h2>

        <SystemEmailRow address={systemEmailAddress} canEdit={canEdit} />

        <NotificationToggleRow
          settingKey={NOTIFY_PAYMENT_RECEIPTS_KEY}
          title="Payment receipts & reminders"
          subtitle="Email members when fees are requested or paid"
          enabled={toggles[NOTIFY_PAYMENT_RECEIPTS_KEY]}
          canEdit={canEdit}
        />

        <NotificationToggleRow
          settingKey={NOTIFY_NEW_SPONSORSHIPS_KEY}
          title="New sponsorship notifications"
          subtitle="Tell the Pre-Weekend Couple when a sponsorship arrives"
          enabled={toggles[NOTIFY_NEW_SPONSORSHIPS_KEY]}
          canEdit={canEdit}
        />

        <SettingRow
          title={
            <span className="flex flex-wrap items-center gap-2">
              Weekly summary for the board
              <Badge variant="outline" className="font-normal">
                Not built yet
              </Badge>
            </span>
          }
          subtitle="A Monday digest of payments and candidate progress"
        >
          <Switch
            checked={false}
            disabled
            aria-label="Weekly summary for the board (not built yet)"
          />
        </SettingRow>
      </CardContent>
    </Card>
  )
}

function SystemEmailRow({
  address,
  canEdit,
}: {
  address: string
  canEdit: boolean
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(address)
  const [isSaving, setIsSaving] = useState(false)

  const startEdit = () => {
    setValue(address)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setValue(address)
    setIsEditing(false)
  }

  const save = async () => {
    const validation = validateSystemEmailAddress(value)

    if (!validation.valid) {
      toast.error(validation.reason)
      return
    }

    setIsSaving(true)
    try {
      const result = await updateSystemEmailAddress(value.trim())

      if (!isNil(result) && isErr(result)) {
        toastError('Unable to update the system email address.', {
          error: result.error,
        })
        return
      }

      toast.success('System email address updated')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      toastError('Unable to update the system email address.', { error })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SettingRow
      title="System email address"
      subtitle={
        isEditing ? (
          <>
            Has to be an address on{' '}
            <span className="font-medium">@{VERIFIED_SENDING_DOMAIN}</span> —
            that&apos;s the only domain our email provider is allowed to send
            from.
          </>
        ) : (
          address
        )
      }
    >
      {isEditing ? (
        <div className="flex w-full items-center gap-1.5 sm:w-auto">
          <Input
            type="email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={`noreply@${VERIFIED_SENDING_DOMAIN}`}
            disabled={isSaving}
            className="h-9 text-sm sm:w-72"
            aria-label="System email address"
          />
          <Button
            size="sm"
            variant="ghost"
            className="size-11 p-0 sm:size-9"
            onClick={save}
            disabled={isSaving}
          >
            <Check className="size-4" />
            <span className="sr-only">Save system email address</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="size-11 p-0 sm:size-9"
            onClick={cancelEdit}
            disabled={isSaving}
          >
            <X className="size-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      ) : (
        canEdit && (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )
      )}
    </SettingRow>
  )
}

function NotificationToggleRow({
  settingKey,
  title,
  subtitle,
  enabled,
  canEdit,
}: {
  settingKey: NotificationToggleKey
  title: string
  subtitle: string
  enabled: boolean
  canEdit: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(enabled)
  const [isPending, startTransition] = useTransition()

  const onCheckedChange = async (next: boolean) => {
    const previous = checked
    setChecked(next)

    const result = await setNotificationToggle({
      key: settingKey,
      enabled: next,
    })

    if (!isNil(result) && isErr(result)) {
      setChecked(previous)
      toastError('Unable to change that setting. Please try again.', {
        error: result.error,
      })
      return
    }

    toast.success(next ? `${title} turned on` : `${title} turned off`)
    startTransition(() => router.refresh())
  }

  return (
    <SettingRow title={title} subtitle={subtitle}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={!canEdit || isPending}
        aria-label={title}
      />
    </SettingRow>
  )
}
