'use client'

import { Errors, getErrorMessage } from '@/lib/error'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { toast } from 'sonner'
import { Toaster } from './ui/sonner'
import { isNil } from 'lodash'

export function Toastbox() {
  return (
    <>
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>
      <Toaster position="top-center" richColors />
    </>
  )
}

// Isolated in its own Suspense boundary so that using useSearchParams() here
// doesn't force the whole root layout to bail out of static rendering.
function ToastListener() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (isNil(error) || !(error in Errors)) {
      return
    }
    toast.error(getErrorMessage(Errors[error as keyof typeof Errors]))

    // Remove error parameter from URL
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('error')
    const newUrl = `${window.location.pathname}${newSearchParams.toString() !== '' ? '?' + newSearchParams.toString() : ''}`
    window.history.replaceState(null, '', newUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only rerun when the error param itself changes, not on every searchParams identity change
  }, [error])

  return null
}
