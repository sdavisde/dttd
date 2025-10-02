'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { AdminWeekends } from '@/components/weekend/AdminWeekends'
import { Weekend } from '@/lib/weekend/types'

const WeekendSidebarPlaceholder = (_: {
  isOpen: boolean
  onClose: () => void
  weekend: Weekend | null
}) => null

type WeekendsProps = {
  canEdit: boolean
  upcomingWeekends: Weekend[]
  pastWeekends: Weekend[]
}

export default function Weekends({
  canEdit,
  upcomingWeekends,
  pastWeekends,
}: WeekendsProps) {
  const [selectedWeekend, setSelectedWeekend] = useState<Weekend | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleWeekendClick = (weekend: Weekend) => {
    if (!canEdit) return
    setSelectedWeekend(weekend)
    setIsSidebarOpen(true)
  }

  const handleAddWeekend = () => {
    if (!canEdit) return
    setSelectedWeekend(null)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedWeekend(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Typography variant="h4" as="h1">
          Weekends
        </Typography>
        {canEdit && (
          <Button
            onClick={handleAddWeekend}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Weekend
          </Button>
        )}
      </div>

      <div className="w-full">
        <div className="w-full mt-4 mb-2">
          <Typography variant="h5">Upcoming Weekends</Typography>
        </div>
        <AdminWeekends
          weekends={upcomingWeekends}
          canEdit={canEdit}
          onWeekendClick={handleWeekendClick}
        />
      </div>

      <div className="w-full">
        <div className="w-full mt-8 mb-2">
          <Typography variant="h5">Past Weekends</Typography>
        </div>
        <AdminWeekends
          weekends={pastWeekends}
          canEdit={canEdit}
          onWeekendClick={handleWeekendClick}
          isPast
        />
      </div>

      <WeekendSidebarPlaceholder
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        weekend={selectedWeekend}
      />
    </div>
  )
}
