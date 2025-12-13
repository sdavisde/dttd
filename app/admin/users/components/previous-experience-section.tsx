import { GroupedExperience } from '@/lib/users/experience'
import { Badge } from '@/components/ui/badge'

type PreviousExperienceSectionProps = {
  experience: GroupedExperience[]
}

export function PreviousExperienceSection({
  experience,
}: PreviousExperienceSectionProps) {
  if (experience.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Service History</h3>
        <p className="text-sm text-muted-foreground italic">
          No service history recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Service History</h3>

      <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-2">
        {experience.map((group, groupIndex) => (
          <div
            key={`${group.community}-${groupIndex}`}
            className="relative pl-6"
          >
            {/* Timeline dot */}
            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-muted-foreground/30 ring-4 ring-background" />

            <div className="mb-3">
              <h4 className="text-base font-semibold text-foreground">
                {group.community === 'DTTD' ? 'Dusty Trails' : group.community}
              </h4>
            </div>

            <div className="space-y-3">
              {group.records.map((record, recordIndex) => (
                <div
                  key={`${record.date}-${recordIndex}`}
                  className="bg-card/50 p-3 rounded-lg border shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-primary">
                      {record.role}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {record.date}
                    </span>
                  </div>

                  {record.rollo && (
                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        Talk: {record.rollo}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
