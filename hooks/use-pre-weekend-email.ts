'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateContactInformation } from '@/services/notifications'
import { isErr } from '@/lib/results'
import { Tables } from '@/lib/supabase/database.types'

type UsePreWeekendEmailProps = {
  contact: Tables<'contact_information'>
}

type UsePreWeekendEmailReturn = {
  email: string
  isEditing: boolean
  isSaving: boolean
  setEmailAction: (email: string) => void
  startEditAction: () => void
  saveAction: () => Promise<void>
  cancelAction: () => void
}

export function usePreWeekendEmail({
  contact,
}: UsePreWeekendEmailProps): UsePreWeekendEmailReturn {
  const router = useRouter()
  const [email, setEmail] = useState(contact.email_address ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const startEdit = () => {
    setIsEditing(true)
  }

  const cancel = () => {
    setEmail(contact.email_address ?? '')
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
    setEmailAction: setEmail,
    startEditAction: startEdit,
    saveAction: save,
    cancelAction: cancel,
  }
}
