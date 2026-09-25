'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { getLoggedInUser } from '@/services/identity/user'
import type { User } from '@/lib/users/types'
import { isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import { isNil } from 'lodash'

type Session = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  refreshSession: () => void
}

const sessionContext = createContext<Session | null>(null)

/** Lets a server layout hand its already-resolved user to the session. */
type Hydrate = (user: User | null) => void
const hydrateContext = createContext<Hydrate | null>(null)

type SessionProviderProps = {
  children: React.ReactNode
}

/**
 * Holds the signed-in user for client components. The user comes from the
 * server layouts (through `SessionHydrator`), which already resolved it for
 * their own render, so no page load or navigation pays an extra lookup.
 * `refreshSession` re-reads it on demand (after a profile save or an
 * impersonation change).
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  // True until a layout hydrates the session or a refresh settles.
  const [isLoading, setIsLoading] = useState(true)

  const hydrate = useCallback<Hydrate>((next) => {
    setUser(next)
    setIsLoading(false)
  }, [])

  const refreshSession = useCallback(() => {
    setIsLoading(true)
    getLoggedInUser()
      .then((result) => {
        if (isErr(result)) {
          logger.error(`Error refreshing session: ${result.error}`)
          setUser(null)
        } else {
          setUser(result.data)
        }
      })
      .catch((error: unknown) => {
        logger.error(`Unexpected error refreshing session: ${String(error)}`)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !isNil(user),
      loading: isLoading,
      refreshSession,
    }),
    [user, isLoading, refreshSession]
  )

  return (
    <hydrateContext.Provider value={hydrate}>
      <sessionContext.Provider value={value}>
        {children}
      </sessionContext.Provider>
    </hydrateContext.Provider>
  )
}

export function useSession() {
  const session = useContext(sessionContext)
  if (isNil(session)) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return session
}

/** @internal for `SessionHydrator` */
export function useSessionHydrate() {
  const hydrate = useContext(hydrateContext)
  if (isNil(hydrate)) {
    throw new Error('useSessionHydrate must be used within a SessionProvider')
  }
  return hydrate
}
