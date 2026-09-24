'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import type { RoleCategory, FilterMode } from './roster-builder-types'
import { CommunitySheet } from './community-sheet'

export function Toolbar({
  search,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  weekendType,
  communityMembers,
  categories,
  onAssign,
}: {
  search: string
  onSearchChange: (v: string) => void
  filterMode: FilterMode
  onFilterModeChange: (v: FilterMode) => void
  weekendType: string
  communityMembers: RosterBuilderCommunityMember[]
  categories: RoleCategory[]
  onAssign: (slotId: string, member: RosterBuilderCommunityMember) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px] sm:flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles or names..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 pl-9 pr-10 text-sm md:h-9"
        />
        {search.length > 0 && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <CommunitySheet
        weekendType={weekendType}
        communityMembers={communityMembers}
        categories={categories}
        onAssign={onAssign}
      />

      <SegmentedControl
        aria-label="Show positions"
        size="md"
        value={filterMode}
        onValueChange={onFilterModeChange}
        options={[
          { value: 'all', label: 'All' },
          { value: 'filled', label: 'Filled' },
          { value: 'empty', label: 'Empty' },
        ]}
      />
    </div>
  )
}
