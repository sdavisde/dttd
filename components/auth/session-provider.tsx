'use client'

import { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { User } from '@/lib/users/types'
import { Result, isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import { PUBLIC_REGEX_ROUTES, SKIP_REGEX_ROUTES } from '@/middleware'

type Session = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

const sessionContext = createContext<Session | null>(null)

type SessionProviderProps = {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true)
      try {
        const userResult = await getLoggedInUser()
        
        const pathIsPublic =
          PUBLIC_REGEX_ROUTES.some((route) => route.test(pathname)) ||
          SKIP_REGEX_ROUTES.some((route) => route.test(pathname))

        if (userResult && isErr(userResult) && !pathIsPublic) {
          logger.error(`Error fetching user at path ${pathname}`, {
            error: userResult.error,
          })
          setUser(null)
        } else {
          setUser(userResult?.data ?? null)
        }
      } catch (error) {
        logger.error(`Unexpected error fetching user at path ${pathname}`, { error })
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [pathname])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading: isLoading,
    }),
    [user, isLoading]
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
