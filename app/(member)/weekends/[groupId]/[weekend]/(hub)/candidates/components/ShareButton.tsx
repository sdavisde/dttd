'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isNil } from 'lodash'
import { Share2, Check, Copy, Share } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

type ShareButtonProps = {
  /** Title for the share dialog (used by Web Share API) */
  title?: string
  /** Text/description for the share (used by Web Share API) */
  text?: string
  /** URL to share (defaults to current page URL) */
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && !isNil(navigator.share)

  const getShareUrl = () => {
    return url ?? window.location.href
  }

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl()
    const shareData = {
      title: title ?? document.title,
      text,
      url: shareUrl,
    }

    try {
      await navigator.share(shareData)
    } catch (err) {
      // User cancelled or share failed - silently ignore
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl()

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API failed, try legacy approach
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share className="h-4 w-4" />
            Share
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
