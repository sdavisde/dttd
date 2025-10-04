'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchActiveWeekends } from '@/lib/queries/weekends'

export function useWeekends() {
  return useQuery({
    queryKey: ['weekends', 'active'],
    queryFn: fetchActiveWeekends,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
  })
}
