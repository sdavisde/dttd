'use client'

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { usePathname } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { User } from '@/lib/users/types'
import { isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import { PUBLIC_REGEX_ROUTES, SKIP_REGEX_ROUTES } from '@/proxy'

type Session = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  refreshSession: () => void
}

const sessionContext = createContext<Session | null>(null)

type SessionProviderProps = {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshSession = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true)
      try {
        const userResult = await getLoggedInUser()

        const pathIsPublic =
          PUBLIC_REGEX_ROUTES.some((route) => route.test(pathname)) ||
          SKIP_REGEX_ROUTES.some((route) => route.test(pathname))

        if (userResult && isErr(userResult) && !pathIsPublic) {
          logger.error(
            `Error fetching user at path ${pathname} error: ${userResult.error}`
          )
          setUser(null)
        } else {
          setUser(userResult?.data ?? null)
        }
      } catch (error) {
        logger.error(
          `Unexpected error fetching user at path ${pathname} error: ${error}`
        )
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [pathname, refreshKey])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading: isLoading,
      refreshSession,
    }),
    [user, isLoading, refreshSession]
  )

  return (
    <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
  )
}

export function useSession() {
  const session = useContext(sessionContext)
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return session
}
