'use client'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'

const SKILLS_OPTIONS: string[] = [
  'Audio/video',
  'Carpenter',
  'Crafts',
  'Music (vocal)',
  'Music (instrument)',
  'Sewing',
  'Computer (spreadsheets)',
  'Computer (powerpoint / creative design)',
  'Nurse / medical',
  'Clergy (ordained)',
  'Plumber',
  'Electrician',
  'Photography',
]

interface SkillsEditSectionProps {
  skills: string[]
  onToggle: (skill: string) => void
  customSkill: string
  onCustomSkillChange: (val: string) => void
  onAddCustomSkill: () => void
  canEdit: boolean
}

export function SkillsEditSection({
  skills,
  onToggle,
  customSkill,
  onCustomSkillChange,
  onAddCustomSkill,
  canEdit,
}: SkillsEditSectionProps) {
  return (
    <section className="space-y-2">
      <Typography variant="muted" className="text-sm font-bold">
        Gifts, Skills &amp; Abilities
      </Typography>
      <div className="bg-muted/20 rounded-md p-4 space-y-3 border">
        <div className="flex flex-wrap gap-2">
          {SKILLS_OPTIONS.map((skill) => (
            <Badge
              key={skill}
              variant={skills.includes(skill) ? 'default' : 'outline'}
              className={canEdit ? 'cursor-pointer select-none' : 'select-none'}
              onClick={canEdit ? () => onToggle(skill) : undefined}
            >
              {skill}
            </Badge>
          ))}
        </div>
        {/* Show custom (non-standard) skills */}
        {skills
          .filter((s) => !SKILLS_OPTIONS.includes(s))
          .map((skill) => (
            <Badge
              key={skill}
              variant="default"
              className={canEdit ? 'cursor-pointer select-none' : 'select-none'}
              onClick={canEdit ? () => onToggle(skill) : undefined}
            >
              {skill}
              {canEdit && ' \u00d7'}
            </Badge>
          ))}
        {canEdit && (
          <div className="flex gap-2">
            <Input
              placeholder="Add custom skill..."
              value={customSkill}
              onChange={(e) => onCustomSkillChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddCustomSkill()
                }
              }}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </section>
  )
}
