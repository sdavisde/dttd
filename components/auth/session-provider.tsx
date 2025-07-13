'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/supabase/types'
import { isErr } from '@/lib/supabase/utils'

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
    async function getUser() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      // Fetch user's roles and permissions
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(
          `
            roles (
              permissions
            )
          `
        )
        .eq('user_id', user.id)

      let permissions: string[] = []
      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError)
      } else {
        // Extract unique permissions from all roles
        const allPermissions = userRoles
          ?.map((ur) => ur.roles.permissions)
          .flat()
          .filter((p): p is string => p !== null)
        const uniquePermissions = [...new Set(allPermissions)]
        permissions = uniquePermissions
      }

      // Fetch user data from public.users table
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (isErr(userDataError)) {
        console.error('Error fetching user data:', userDataError)
      }

      setUser({
        ...user,
        permissions,
        user_metadata: {
          ...user.user_metadata,
          first_name: userData?.first_name ?? user.user_metadata?.first_name,
          last_name: userData?.last_name ?? user.user_metadata?.last_name,
          gender: userData?.gender ?? user.user_metadata?.gender,
          phone_number: userData?.phone_number ?? user.user_metadata?.phone_number,
        },
      })
      setIsAuthenticated(!!user)
      setLoading(false)
    }

    getUser()
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
