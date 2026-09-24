'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateContactInformation,
  type ContactInfo,
} from '@/services/notifications'
import { ok } from '@/lib/results'

type UsePreWeekendEmailProps = {
  contact: ContactInfo
}

/**
 * The Pre-Weekend Couple's notification email, edited inline and auto-saved
 * (see `InlineAutoSaveField`). `email` is the last saved value.
 */
export function usePreWeekendEmail({ contact }: UsePreWeekendEmailProps) {
  const router = useRouter()
  const [email, setEmail] = useState(contact.emailAddress ?? '')
  const [isEditingEmail, setIsEditingEmail] = useState(false)

  const saveEmail = async (emailAddress: string) =>
    (await updateContactInformation({
      contactId: 'preweekend-couple',
      emailAddress,
    })) ?? ok(null)

  const onEmailSaved = (saved: string) => {
    setEmail(saved.trim())
    router.refresh()
  }

  return {
    email,
    isEditingEmail,
    startEditEmail: () => setIsEditingEmail(true),
    finishEditEmail: () => setIsEditingEmail(false),
    saveEmail,
    onEmailSaved,
  }
}
