'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { isNil } from 'lodash'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InlineAutoSaveField } from '@/components/auto-save/inline-auto-save-field'
import { Switch } from '@/components/ui/switch'
import { isErr, ok } from '@/lib/results'
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
        <InlineAutoSaveField
          initialValue={address}
          type="email"
          placeholder={`noreply@${VERIFIED_SENDING_DOMAIN}`}
          ariaLabel="System email address"
          inputClassName="h-9 text-sm sm:w-72"
          className="w-full sm:w-auto"
          errorMessage="Unable to update the system email address."
          validate={(value) => {
            const validation = validateSystemEmailAddress(value)
            return validation.valid ? null : validation.reason
          }}
          save={async (value) =>
            (await updateSystemEmailAddress(value)) ?? ok(null)
          }
          onSaved={() => router.refresh()}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
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
