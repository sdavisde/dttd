'use client'

import { usePathname } from 'next/navigation'
import { Check, Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useShare } from '@/hooks/use-share'

type PageHeaderShareButtonProps = {
  /** The page title, used as the label of the native share sheet. */
  title: string
}

/**
 * Copy-link control that lives in every admin {@link PageHeader}.
 *
 * It opts in by area rather than by page: the button renders only under
 * `/admin`, so all admin pages get it without editing a single page file and
 * public pages that share `PageHeader` stay exactly as they were. A page can
 * still opt out entirely with `<PageHeader shareable={false}>`.
 *
 * The URL is read from the browser rather than `getUrl()` because `SITE_URL`
 * is a server-only env var — it is inlined as `undefined` in client bundles.
 */
export function PageHeaderShareButton({ title }: PageHeaderShareButtonProps) {
  const pathname = usePathname()
  const { share, linkCopied } = useShare()

  if (!pathname.startsWith('/admin')) return null

  const handleShare = () => {
    const { origin, pathname: browserPath, search } = window.location
    // Hash is dropped on purpose: it is view state, not a shareable location.
    void share({ title, url: `${origin}${browserPath}${search}` })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          // 44px touch target on phones, 36px on desktop.
          className="size-11 sm:size-9"
          onClick={handleShare}
          aria-label="Copy link to this page"
        >
          {linkCopied ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy link to this page</TooltipContent>
    </Tooltip>
  )
}
