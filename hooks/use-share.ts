'use client'

import { useCallback, useState } from 'react'
import { isNil } from 'lodash'
import { toast } from 'sonner'

interface ShareOptions {
  /** Title for the share sheet */
  title: string
  /** Descriptive text for the share sheet */
  text?: string
  /** URL to share */
  url: string
  /** File to include in the share (image, PDF, etc.) */
  file?: File
}

interface UseShareReturn {
  /** Share via the native Web Share API, falls back to copy link */
  share: (options: ShareOptions) => Promise<void>
  /** Copy a URL to the clipboard */
  copyLink: (url: string) => Promise<void>
  /** Download a blob as a file */
  download: (blob: Blob, fileName: string) => void
  /** Whether the link was recently copied (resets after 2s) */
  linkCopied: boolean
}

export function useShare(): UseShareReturn {
  const [linkCopied, setLinkCopied] = useState(false)

  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API failed, try legacy approach
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setLinkCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setLinkCopied(false), 2000)
  }, [])

  const share = useCallback(
    async ({ title, text, url, file }: ShareOptions) => {
      if (!isNil(navigator.share)) {
        const shareData: ShareData = {
          title,
          text,
          url,
          ...(!isNil(file) ? { files: [file] } : {}),
        }

        // Try sharing with file if provided
        if (!isNil(file) && navigator.canShare?.(shareData) === true) {
          try {
            await navigator.share(shareData)
            return
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return
          }
        }

        // Fall back to URL-only share
        try {
          await navigator.share({ title, url })
          return
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return
        }
      }

      // Final fallback: copy URL to clipboard
      await copyLink(url)
    },
    [copyLink]
  )

  const download = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded')
  }, [])

  return { share, copyLink, download, linkCopied }
}
