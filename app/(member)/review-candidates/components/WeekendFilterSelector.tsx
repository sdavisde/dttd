'use client'

import { WeekendType } from '@/lib/weekend/types'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

interface WeekendOptions {
  id: string
  label: string
}

interface WeekendFilterSelectorProps {
  weekendOptions: WeekendOptions[]
  /**
   * Server-resolved defaults, used when the URL carries no filter params. The
   * page no longer redirects to decorate the URL, so the selector has to fall
   * back to what the server actually rendered.
   */
  currentWeekendId?: string
  currentWeekendType?: WeekendType
}

export function WeekendFilterSelector({
  weekendOptions,
  currentWeekendId,
  currentWeekendType,
}: WeekendFilterSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedWeekendId =
    searchParams.get('weekend') ?? currentWeekendId ?? ''
  const selectedWeekendType =
    (searchParams.get('weekendType') as WeekendType | null) ??
    currentWeekendType ??
    WeekendType.MENS

  const handleWeekendChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== '') {
      params.set('weekend', value)
    } else {
      params.delete('weekend')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== '') {
      params.set('weekendType', value)
    } else {
      params.delete('weekendType')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 flex-row sm:items-end mb-6">
      <div className="space-y-2 w-1/2 sm:w-fit">
        <Label>Select Weekend</Label>
        <Select value={selectedWeekendId} onValueChange={handleWeekendChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a weekend" />
          </SelectTrigger>
          <SelectContent>
            {weekendOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 w-1/2 sm:w-fit">
        <Label>Gender</Label>
        <Tabs value={selectedWeekendType} onValueChange={handleTypeChange}>
          <TabsList className="w-full">
            <TabsTrigger value={WeekendType.MENS}>Men</TabsTrigger>
            <TabsTrigger value={WeekendType.WOMENS}>Women</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
