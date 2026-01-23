import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, X } from 'lucide-react'
import { FacetedFilter } from '@/components/ui/faceted-filter'
import { CandidateStatus } from '@/lib/candidates/types'
import { useFeatureFlags } from '@/hooks/use-feature-flags'

interface CandidateTableControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilters: CandidateStatus[]
  onToggleStatus: (status: CandidateStatus) => void
  showArchived: boolean
  onToggleArchived: (show: boolean) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS: { value: CandidateStatus; label: string }[] = [
  { value: 'sponsored', label: 'Sponsored' },
  { value: 'awaiting_forms', label: 'Awaiting Forms' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
]

export function CandidateTableControls({
  searchQuery,
  onSearchChange,
  statusFilters,
  onToggleStatus,
  showArchived,
  onToggleArchived,
  onClearFilters,
}: CandidateTableControlsProps) {
  const { isEnabled } = useFeatureFlags()
  const showFilters = isEnabled('candidate-filters')

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilters.length !== 6 || // Default is 6 (all except rejected)
    showArchived

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or sponsor..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        {showFilters && (
          <FacetedFilter
            title="Status"
            options={STATUS_OPTIONS}
            selectedValues={statusFilters}
            onSelect={(values) => {
              const newSet = new Set(values as CandidateStatus[])
              const oldSet = new Set(statusFilters)

              // Find items to add (in new but not old)
              for (const val of newSet) {
                if (!oldSet.has(val)) {
                  onToggleStatus(val)
                }
              }
              // Find items to remove (in old but not new)
              for (const val of oldSet) {
                if (!newSet.has(val)) {
                  onToggleStatus(val)
                }
              }
            }}
          />
        )}

        {/* Show Archived Toggle */}
        {showFilters && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-archived"
              checked={showArchived}
              onCheckedChange={(checked) => onToggleArchived(checked === true)}
            />
            <Label htmlFor="show-archived" className="text-sm cursor-pointer">
              Show Archived
            </Label>
          </div>
        )}

        {/* Clear Filters Button */}
        {showFilters && hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
