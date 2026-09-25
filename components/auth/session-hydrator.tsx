'use client'

import { useLayoutEffect } from 'react'
import type { User } from '@/lib/users/types'
import { useSessionHydrate } from './session-provider'

/**
 * Pushes the user a server layout resolved into the session context. Rendered
 * by the member and admin shells; it re-runs whenever the layout re-renders
 * with a new user object (e.g. after `router.refresh()`) and clears the
 * session when the shell unmounts, so public pages see no user. Do not nest
 * one under another shell's hydrator: the inner one's unmount would clear
 * the outer one's user.
 */
export function SessionHydrator({ user }: { user: User }) {
  const hydrate = useSessionHydrate()
  useLayoutEffect(() => {
    hydrate(user)
    return () => hydrate(null)
  }, [hydrate, user])
  return null
}
