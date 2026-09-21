'use client'

import { Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShare } from '@/hooks/use-share'

/**
 * Hands an admin the public sign-up link to paste wherever they're inviting
 * people. There are no per-person invitations — one link serves everyone.
 */
export function CopyJoinLinkButton({ joinUrl }: { joinUrl: string }) {
  const { copyLink, linkCopied } = useShare()

  return (
    <Button onClick={() => copyLink(joinUrl)}>
      {linkCopied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {linkCopied ? 'Copied' : 'Copy join link'}
    </Button>
  )
}
