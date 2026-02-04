'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  updateContactInformation,
  type ContactInfo,
} from '@/services/notifications'
import { isErr } from '@/lib/results'

type UsePreWeekendEmailProps = {
  contact: ContactInfo
}

type UsePreWeekendEmailReturn = {
  email: string
  isEditing: boolean
  isSaving: boolean
  setEmail: (email: string) => void
  startEdit: () => void
  save: () => Promise<void>
  cancel: () => void
}

export function usePreWeekendEmail({
  contact,
}: UsePreWeekendEmailProps): UsePreWeekendEmailReturn {
  const router = useRouter()
  const [email, setEmail] = useState(contact.emailAddress ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const startEdit = () => {
    setIsEditing(true)
  }

  const cancel = () => {
    setEmail(contact.emailAddress ?? '')
    setIsEditing(false)
  }

  const save = async () => {
    if (!email.trim()) {
      toast.error('Email address cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const result = await updateContactInformation({
        contactId: 'preweekend-couple',
        emailAddress: email.trim(),
      })

      if (result && isErr(result)) {
        toast.error(result.error)
        return
      }

      toast.success('Pre-Weekend Couple email updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update email'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    email,
    isEditing,
    isSaving,
    setEmail,
    startEdit,
    save,
    cancel,
  }
}
