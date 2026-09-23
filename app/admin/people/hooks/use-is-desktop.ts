'use client'

import { useEffect, useState } from 'react'

/** Tailwind's `xl` breakpoint — where the person editor becomes an inline panel. */
const DESKTOP_BREAKPOINT = 1280

/**
 * True once the viewport is wide enough for the split table + editor layout.
 * Starts false so the server render and the first client render agree.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    const onChange = () => setIsDesktop(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
