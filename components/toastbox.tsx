'use client'

import { Errors, getErrorMessage } from '@/lib/error'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Toaster } from './ui/sonner'

export function Toastbox() {
  return <Toaster position="top-center" richColors />
}

export function useToastListener() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!error || !(error in Errors)) {
      return
    }
    toast.error(getErrorMessage(Errors[error as keyof typeof Errors]))

    // Remove error parameter from URL
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('error')
    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`
    router.replace(newUrl)
  }, [error, searchParams, router])
}
