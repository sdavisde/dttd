'use client'

import { useState, type ComponentProps } from 'react'
import Link from 'next/link'

type IntentLinkProps = Omit<ComponentProps<typeof Link>, 'prefetch'>

/**
 * A `next/link` that prefetches only once the viewer shows intent (hover,
 * focus or touch) — and then prefetches the whole page, data included, so the
 * navigation that usually follows is served from the router cache. Nothing is
 * fetched for links that merely scroll into view.
 */
export function IntentLink({
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: IntentLinkProps) {
  const [intent, setIntent] = useState(false)
  return (
    <Link
      {...props}
      prefetch={intent ? true : false}
      onMouseEnter={(event) => {
        setIntent(true)
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        setIntent(true)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        setIntent(true)
        onTouchStart?.(event)
      }}
    />
  )
}
