'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Custom hook for managing URL hash state.
 * Provides reactive access to the URL hash and methods to update it.
 *
 * @returns [hash, setHash] - Current hash value (without #) and setter function
 *
 * @example
 * const [hash, setHash] = useHashState()
 * // hash = "2024-02-15" when URL is /page#2024-02-15
 * setHash("2024-02-16") // Updates URL to /page#2024-02-16
 * setHash(null) // Clears the hash
 */
export function useHashState(): [string | null, (hash: string | null) => void] {
  const [hash, setHashState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const currentHash = window.location.hash.slice(1)
    return currentHash || null
  })

  // Listen for hash changes (browser back/forward, manual URL changes)
  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      setHashState(newHash || null)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const setHash = useCallback((newHash: string | null) => {
    if (newHash) {
      window.history.pushState(null, '', `#${newHash}`)
    } else {
      // Remove hash without triggering a scroll
      window.history.pushState(null, '', window.location.pathname)
    }
    setHashState(newHash)
  }, [])

  return [hash, setHash]
}

/**
 * Validates if a hash string is a valid date in YYYY-MM-DD format
 *
 * @param hash - The hash string (e.g., "2024-02-15")
 * @returns The date string if valid, or null if invalid
 */
export function parseDateFromHash(hash: string | null): string | null {
  if (!hash) return null
  const match = hash.match(/^\d{4}-\d{2}-\d{2}$/)
  return match ? hash : null
}
