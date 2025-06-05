'use client'

import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

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
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsAuthenticated(!!user)
      setLoading(false)
    })
  }, [pathname])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
    }),
    [user, isAuthenticated, loading]
  )

  return <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
}

export function useSession() {
  const session = useContext(sessionContext)
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return session
}
