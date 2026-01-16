'use client'

import { useQuery } from '@tanstack/react-query'
import { getActiveWeekends } from '@/services/weekend'
import { isErr } from '@/lib/results'
import { logger } from '@/lib/logger'

export function useWeekends() {
  return useQuery({
    queryKey: ['weekends', 'active'],
    queryFn: async () => {
      const result = await getActiveWeekends()
      if (isErr(result)) {
        logger.error(result.error)
        return null
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
