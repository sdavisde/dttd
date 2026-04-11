'use client'

import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import type { RoleCategory, FilterMode } from './roster-builder-types'
import { CommunitySheet } from './community-sheet'

export function Toolbar({
  search,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  communityMembers,
  categories,
  onAssign,
  filledCount,
  totalCount,
}: {
  search: string
  onSearchChange: (v: string) => void
  filterMode: FilterMode
  onFilterModeChange: (v: FilterMode) => void
  communityMembers: RosterBuilderCommunityMember[]
  categories: RoleCategory[]
  onAssign: (slotId: string, member: RosterBuilderCommunityMember) => void
  filledCount: number
  totalCount: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] max-w-[300px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles or names..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
        {search.length > 0 && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <CommunitySheet
        communityMembers={communityMembers}
        categories={categories}
        onAssign={onAssign}
      />

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {(['all', 'filled', 'empty'] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onFilterModeChange(mode)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filterMode === mode
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {mode === 'all'
              ? 'All'
              : mode === 'filled'
                ? 'Filled only'
                : 'Empty only'}
          </button>
        ))}
      </div>

      <p className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
        <span className="font-semibold text-foreground tabular-nums">
          {filledCount}
        </span>{' '}
        /{' '}
        <span className="font-semibold text-foreground tabular-nums">
          {totalCount}
        </span>{' '}
        positions filled
      </p>
    </div>
  )
}
