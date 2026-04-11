'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Weekend } from '@/lib/weekend/types'
import { WeekendType } from '@/lib/weekend/types'

export function WeekendPicker({ weekends }: { weekends: Weekend[] }) {
  return (
    <div className="container mx-auto px-4 pt-12 pb-8 max-w-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Roster Builder</h1>
        </div>
        <p className="text-muted-foreground">
          Select a weekend to build its roster.
        </p>
      </div>
      <div className="space-y-3">
        {weekends.map((weekend) => {
          const label = weekend.type === WeekendType.MENS ? "Men's" : "Women's"
          return (
            <Link
              key={weekend.id}
              href={`/roster-builder?weekendId=${weekend.id}`}
            >
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      DTTD #{weekend.number ?? '?'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {label} Weekend
                    </p>
                  </div>
                  <Badge variant="outline">{label}</Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
